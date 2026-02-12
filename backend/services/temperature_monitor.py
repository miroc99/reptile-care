"""溫度監控服務
支援 DS18B20 (1-Wire) 和 Modbus RTU/TCP 溫度探頭
"""
import asyncio
import logging
import random
from typing import Optional, List, Dict
from datetime import datetime
from config import settings

logger = logging.getLogger(__name__)


class TemperatureSensor:
    """溫度感測器基類"""
    
    def __init__(self, sensor_id: str, sensor_type: str):
        self.sensor_id = sensor_id
        self.sensor_type = sensor_type
        self.last_reading: Optional[float] = None
        self.last_update: Optional[datetime] = None
    
    async def read_temperature(self) -> Optional[float]:
        """讀取溫度"""
        raise NotImplementedError
    
    async def read_humidity(self) -> Optional[float]:
        """讀取濕度（如果支援）"""
        return None


class DS18B20Sensor(TemperatureSensor):
    """DS18B20 1-Wire 溫度感測器"""
    
    def __init__(self, sensor_id: str, device_path: str = None):
        super().__init__(sensor_id, "DS18B20")
        self.device_path = device_path or f"/sys/bus/w1/devices/{sensor_id}/w1_slave"
    
    async def read_temperature(self) -> Optional[float]:
        """從 1-Wire 文件系統讀取溫度"""
        try:
            # 在 Linux 上，DS18B20 數據位於 /sys/bus/w1/devices/
            with open(self.device_path, 'r') as f:
                lines = f.readlines()
            
            # 檢查 CRC 是否正確
            if lines[0].strip()[-3:] != 'YES':
                logger.warning(f"感測器 {self.sensor_id} CRC 錯誤")
                return None
            
            # 解析溫度值
            temp_pos = lines[1].find('t=')
            if temp_pos != -1:
                temp_string = lines[1][temp_pos + 2:]
                temp_c = float(temp_string) / 1000.0
                
                self.last_reading = temp_c
                self.last_update = datetime.utcnow()
                
                logger.debug(f"感測器 {self.sensor_id} 溫度: {temp_c}°C")
                return temp_c
            
            return None
            
        except FileNotFoundError:
            logger.error(f"找不到感測器 {self.sensor_id} 的設備文件: {self.device_path}")
            return None
        except Exception as e:
            logger.error(f"讀取感測器 {self.sensor_id} 時發生錯誤: {e}")
            return None


class SimulatedSensor(TemperatureSensor):
    """模擬溫度感測器（用於測試）"""
    
    def __init__(self, sensor_id: str, base_temp: float = 25.0):
        super().__init__(sensor_id, "Simulated")
        self.base_temp = base_temp
        self.drift = 0.0
    
    async def read_temperature(self) -> Optional[float]:
        """模擬溫度讀取（帶隨機波動）"""
        # 模擬緩慢的溫度漂移
        self.drift += random.uniform(-0.1, 0.1)
        self.drift = max(-2.0, min(2.0, self.drift))  # 限制漂移範圍
        
        # 加上快速隨機噪音
        noise = random.uniform(-0.3, 0.3)
        temp = self.base_temp + self.drift + noise
        
        self.last_reading = temp
        self.last_update = datetime.utcnow()
        
        logger.debug(f"[模擬] 感測器 {self.sensor_id} 溫度: {temp:.2f}°C")
        return temp
    
    async def read_humidity(self) -> Optional[float]:
        """模擬濕度讀取"""
        humidity = 50.0 + random.uniform(-10, 10)
        return humidity


class TemperatureMonitorService:
    """溫度監控服務"""
    
    def __init__(self, simulation_mode: bool = True):
        self.simulation_mode = simulation_mode
        self.sensors: Dict[str, TemperatureSensor] = {}
        self.polling_task: Optional[asyncio.Task] = None
        self._running = False
        
        # 溫度記錄回調
        self.on_temperature_reading: Optional[callable] = None
        self.on_temperature_alert: Optional[callable] = None
    
    def add_sensor(
        self,
        sensor_id: str,
        sensor_type: str = "simulated",
        **kwargs
    ):
        """添加溫度感測器
        
        Args:
            sensor_id: 感測器唯一識別碼
            sensor_type: 感測器類型 (ds18b20, simulated)
            **kwargs: 感測器特定參數
        """
        if sensor_type == "ds18b20":
            sensor = DS18B20Sensor(sensor_id, **kwargs)
        elif sensor_type == "simulated" or self.simulation_mode:
            sensor = SimulatedSensor(sensor_id, **kwargs)
        else:
            raise ValueError(f"不支援的感測器類型: {sensor_type}")
        
        self.sensors[sensor_id] = sensor
        logger.info(f"已添加感測器: {sensor_id} ({sensor_type})")
    
    def remove_sensor(self, sensor_id: str):
        """移除感測器"""
        if sensor_id in self.sensors:
            del self.sensors[sensor_id]
            logger.info(f"已移除感測器: {sensor_id}")
    
    async def read_sensor(self, sensor_id: str) -> Optional[Dict]:
        """讀取單個感測器"""
        sensor = self.sensors.get(sensor_id)
        if not sensor:
            logger.warning(f"找不到感測器: {sensor_id}")
            return None
        
        temperature = await sensor.read_temperature()
        humidity = await sensor.read_humidity()
        
        if temperature is None:
            return None
        
        return {
            "sensor_id": sensor_id,
            "sensor_type": sensor.sensor_type,
            "temperature": temperature,
            "humidity": humidity,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def read_all_sensors(self) -> List[Dict]:
        """讀取所有感測器"""
        readings = []
        
        for sensor_id in self.sensors:
            reading = await self.read_sensor(sensor_id)
            if reading:
                readings.append(reading)
        
        return readings
    
    async def poll_temperatures(self):
        """背景任務：定期輪詢溫度"""
        logger.info(f"溫度監控服務啟動，輪詢間隔: {settings.temp_poll_interval}秒")
        
        while self._running:
            try:
                readings = await self.read_all_sensors()
                
                # 處理每個讀數
                for reading in readings:
                    # 呼叫記錄回調
                    if self.on_temperature_reading:
                        await self.on_temperature_reading(reading)
                    
                    # 檢查告警條件
                    temp = reading["temperature"]
                    if temp < settings.temp_warning_low or temp > settings.temp_warning_high:
                        if self.on_temperature_alert:
                            await self.on_temperature_alert(reading, "temperature_out_of_range")
                
                # 等待下次輪詢
                await asyncio.sleep(settings.temp_poll_interval)
                
            except Exception as e:
                logger.error(f"溫度輪詢時發生錯誤: {e}")
                await asyncio.sleep(5)  # 錯誤後短暫等待
    
    async def start(self):
        """啟動監控服務"""
        if self._running:
            logger.warning("溫度監控服務已在運行")
            return
        
        self._running = True
        self.polling_task = asyncio.create_task(self.poll_temperatures())
        logger.info("溫度監控服務已啟動")
    
    async def stop(self):
        """停止監控服務"""
        if not self._running:
            return
        
        self._running = False
        
        if self.polling_task:
            self.polling_task.cancel()
            try:
                await self.polling_task
            except asyncio.CancelledError:
                pass
        
        logger.info("溫度監控服務已停止")
    
    def get_sensor_status(self) -> List[Dict]:
        """取得所有感測器狀態"""
        status = []
        
        for sensor_id, sensor in self.sensors.items():
            status.append({
                "sensor_id": sensor_id,
                "sensor_type": sensor.sensor_type,
                "last_reading": sensor.last_reading,
                "last_update": sensor.last_update.isoformat() if sensor.last_update else None,
                "status": "online" if sensor.last_reading is not None else "offline"
            })
        
        return status


# 全局服務實例
_monitor_service: Optional[TemperatureMonitorService] = None


def get_monitor_service(simulation_mode: bool = True) -> TemperatureMonitorService:
    """取得全局監控服務實例"""
    global _monitor_service
    if _monitor_service is None:
        _monitor_service = TemperatureMonitorService(simulation_mode=simulation_mode)
    return _monitor_service
