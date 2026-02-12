"""設備控制服務 - 整合繼電器控制與溫度監控"""
import asyncio
import logging
from typing import Optional, Dict
from datetime import datetime
from sqlmodel import Session, select
from models import RelayChannel, EventLog, TemperatureLog, Tank
from services.modbus_controller import get_controller
from services.temperature_monitor import get_monitor_service

logger = logging.getLogger(__name__)


class DeviceControlService:
    """設備控制服務
    
    負責：
    1. 繼電器狀態同步到資料庫
    2. 溫度讀數記錄到資料庫
    3. 基於溫度的自動控制邏輯
    4. 手動覆寫處理
    """
    
    def __init__(self, db_session: Session, simulation_mode: bool = True):
        self.db = db_session
        self.simulation_mode = simulation_mode
        self.relay_controller = get_controller(simulation_mode=simulation_mode)
        self.temp_monitor = get_monitor_service(simulation_mode=simulation_mode)
        
        # 設定回調
        self.temp_monitor.on_temperature_reading = self.handle_temperature_reading
        self.temp_monitor.on_temperature_alert = self.handle_temperature_alert
        
        logger.info(f"DeviceControlService 初始化 (simulation={simulation_mode})")
    
    async def initialize(self):
        """初始化服務"""
        # 連接繼電器控制器
        await self.relay_controller.connect()
        
        # 初始化感測器（示例）
        # 實際使用時根據資料庫中的 Tank 配置動態添加
        self.temp_monitor.add_sensor("tank1_hot", sensor_type="simulated", base_temp=28.0)
        self.temp_monitor.add_sensor("tank1_cool", sensor_type="simulated", base_temp=24.0)
        
        # 啟動溫度監控
        await self.temp_monitor.start()
        
        logger.info("DeviceControlService 初始化完成")
    
    async def shutdown(self):
        """關閉服務"""
        await self.temp_monitor.stop()
        await self.relay_controller.disconnect()
        logger.info("DeviceControlService 已關閉")
    
    async def set_relay_channel(
        self,
        channel: int,
        state: bool,
        manual: bool = False
    ) -> bool:
        """設置繼電器通道狀態
        
        Args:
            channel: 通道編號 (0-15)
            state: 開關狀態
            manual: 是否為手動操作
        """
        # 控制硬件
        success = await self.relay_controller.set_relay(channel, state)
        
        if not success:
            logger.error(f"設置繼電器 {channel} 失敗")
            return False
        
        # 更新資料庫
        stmt = select(RelayChannel).where(RelayChannel.channel == channel)
        relay = self.db.exec(stmt).first()
        
        if relay:
            relay.current_state = state
            relay.updated_at = datetime.utcnow()
            if manual:
                relay.manual_override = True
            self.db.add(relay)
            self.db.commit()
        
        # 記錄事件
        event = EventLog(
            event_type="relay_control",
            severity="info",
            message=f"繼電器 {channel} {'手動' if manual else '自動'}設為 {'ON' if state else 'OFF'}",
            related_entity_type="relay",
            related_entity_id=relay.id if relay else None
        )
        self.db.add(event)
        self.db.commit()
        
        logger.info(f"繼電器 {channel} 設為 {'ON' if state else 'OFF'} (manual={manual})")
        return True
    
    async def handle_temperature_reading(self, reading: Dict):
        """處理溫度讀數"""
        # 解析感測器 ID 以確定所屬的 Tank
        # 格式假設為 "tank{id}_{location}"
        sensor_id = reading["sensor_id"]
        
        try:
            tank_id = int(sensor_id.split("_")[0].replace("tank", ""))
        except:
            logger.warning(f"無法解析感測器 ID: {sensor_id}")
            return
        
        # 記錄到資料庫
        temp_log = TemperatureLog(
            tank_id=tank_id,
            temperature=reading["temperature"],
            humidity=reading.get("humidity"),
            sensor_id=sensor_id
        )
        self.db.add(temp_log)
        self.db.commit()
        
        # 檢查是否需要自動控制
        await self.check_temperature_control(tank_id, reading["temperature"])
    
    async def check_temperature_control(self, tank_id: int, temperature: float):
        """基於溫度的自動控制邏輯"""
        # 查詢 Tank 配置
        tank = self.db.get(Tank, tank_id)
        if not tank or not tank.active:
            return
        
        # 查詢該 Tank 的加熱設備
        stmt = select(RelayChannel).where(
            RelayChannel.tank_id == tank_id,
            RelayChannel.device_type == "heating",
            RelayChannel.enabled == True,
            RelayChannel.manual_override == False
        )
        heating_relays = self.db.exec(stmt).all()
        
        # 簡單的溫控邏輯
        for relay in heating_relays:
            if temperature < tank.target_temp_min:
                # 溫度過低，開啟加熱
                if not relay.current_state:
                    await self.set_relay_channel(relay.channel, True, manual=False)
            elif temperature > tank.target_temp_max:
                # 溫度過高，關閉加熱
                if relay.current_state:
                    await self.set_relay_channel(relay.channel, False, manual=False)
    
    async def handle_temperature_alert(self, reading: Dict, alert_type: str):
        """處理溫度告警"""
        event = EventLog(
            event_type="temperature_alert",
            severity="warning",
            message=f"感測器 {reading['sensor_id']} 溫度異常: {reading['temperature']:.1f}°C",
            details=f"告警類型: {alert_type}"
        )
        self.db.add(event)
        self.db.commit()
        
        logger.warning(f"溫度告警: {reading['sensor_id']} = {reading['temperature']:.1f}°C")
    
    async def sync_relay_states(self):
        """同步所有繼電器狀態到資料庫"""
        states = await self.relay_controller.read_all_relays()
        
        if not states:
            logger.error("無法讀取繼電器狀態")
            return
        
        for channel, state in enumerate(states):
            stmt = select(RelayChannel).where(RelayChannel.channel == channel)
            relay = self.db.exec(stmt).first()
            
            if relay and relay.current_state != state:
                relay.current_state = state
                relay.updated_at = datetime.utcnow()
                self.db.add(relay)
        
        self.db.commit()
        logger.debug("繼電器狀態已同步")
    
    def clear_manual_override(self, channel: int):
        """清除手動覆寫模式"""
        stmt = select(RelayChannel).where(RelayChannel.channel == channel)
        relay = self.db.exec(stmt).first()
        
        if relay:
            relay.manual_override = False
            relay.updated_at = datetime.utcnow()
            self.db.add(relay)
            self.db.commit()
            logger.info(f"繼電器 {channel} 手動覆寫已清除")


# 全局服務實例（需要在請求中創建，因為需要 db session）
_device_service: Optional[DeviceControlService] = None


def get_device_service(db: Session, simulation_mode: bool = True) -> DeviceControlService:
    """取得設備控制服務"""
    global _device_service
    if _device_service is None:
        _device_service = DeviceControlService(db, simulation_mode=simulation_mode)
    return _device_service
