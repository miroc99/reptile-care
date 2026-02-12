"""開發者工具相關 API 路由"""
import asyncio
import logging
from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from services.modbus_controller import get_controller
from services.temperature_monitor import get_monitor_service

router = APIRouter(prefix="/api/dev", tags=["開發者工具"])

# WebSocket 連接管理
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self._lock = asyncio.Lock()
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            self.active_connections.append(websocket)
        logging.info(f"WebSocket 連接建立，總連接數: {len(self.active_connections)}")
    
    async def disconnect(self, websocket: WebSocket):
        async with self._lock:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
        logging.info(f"WebSocket 連接關閉，總連接數: {len(self.active_connections)}")
    
    async def broadcast(self, message: dict):
        """廣播訊息到所有連接的客戶端"""
        if not self.active_connections:
            return
        
        disconnected = []
        async with self._lock:
            for connection in self.active_connections[:]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logging.error(f"發送 WebSocket 訊息失敗: {e}")
                    disconnected.append(connection)
        
        # 清理斷開的連接
        for conn in disconnected:
            await self.disconnect(conn)

manager = ConnectionManager()


class RelayControlRequest(BaseModel):
    channel: int
    state: bool


class AllRelaysControlRequest(BaseModel):
    state: bool


@router.get("/controller/status")
async def get_controller_status():
    """取得 Modbus 控制器完整狀態"""
    controller = get_controller()
    status = await controller.get_status_dict()
    
    # 添加更多詳細信息
    relay_states = []
    if status['relay_states']:
        for i, state in enumerate(status['relay_states']):
            relay_states.append({
                "channel": i,
                "state": state,
                "state_text": "ON" if state else "OFF"
            })
    
    return {
        **status,
        "relay_details": relay_states
    }


@router.post("/controller/relay/{channel}")
async def control_relay(channel: int, request: RelayControlRequest):
    """控制單個繼電器（開發者模式）"""
    controller = get_controller()
    
    success = await controller.set_relay(request.channel, request.state)
    
    if not success:
        return {"success": False, "message": "控制失敗"}
    
    # 讀取新狀態
    new_state = await controller.read_relay_status(request.channel)
    
    return {
        "success": True,
        "channel": request.channel,
        "state": new_state,
        "message": f"通道 {request.channel} 已設為 {'ON' if new_state else 'OFF'}"
    }


@router.post("/controller/relay/{channel}/toggle")
async def toggle_relay(channel: int):
    """切換繼電器狀態"""
    controller = get_controller()
    
    success = await controller.toggle_relay(channel)
    
    if not success:
        return {"success": False, "message": "切換失敗"}
    
    new_state = await controller.read_relay_status(channel)
    
    return {
        "success": True,
        "channel": channel,
        "state": new_state,
        "message": f"通道 {channel} 已切換為 {'ON' if new_state else 'OFF'}"
    }


@router.post("/controller/all-relays")
async def control_all_relays(request: AllRelaysControlRequest):
    """控制所有繼電器"""
    controller = get_controller()
    
    success = await controller.set_all_relays(request.state)
    
    if not success:
        return {"success": False, "message": "控制失敗"}
    
    return {
        "success": True,
        "state": request.state,
        "message": f"所有繼電器已設為 {'ON' if request.state else 'OFF'}"
    }


@router.post("/controller/flash/{channel}")
async def flash_relay(channel: int, duration_ms: int = 500):
    """繼電器閃爍測試"""
    controller = get_controller()
    
    success = await controller.flash_relay(channel, duration_ms=duration_ms)
    
    return {
        "success": success,
        "channel": channel,
        "duration_ms": duration_ms,
        "message": f"通道 {channel} 閃爍 {duration_ms}ms {'完成' if success else '失敗'}"
    }


@router.get("/sensors/raw")
async def get_raw_sensor_data():
    """取得所有感測器原始數據"""
    monitor = get_monitor_service()
    
    # 讀取所有感測器
    readings = await monitor.read_all_sensors()
    
    # 取得感測器狀態
    sensor_status = monitor.get_sensor_status()
    
    return {
        "current_readings": readings,
        "sensor_status": sensor_status,
        "total_sensors": len(sensor_status)
    }


@router.get("/sensors/status")
async def get_sensors_status():
    """取得感測器詳細狀態"""
    monitor = get_monitor_service()
    status = monitor.get_sensor_status()
    
    return {
        "sensors": status,
        "total": len(status),
        "online": sum(1 for s in status if s['status'] == 'online'),
        "offline": sum(1 for s in status if s['status'] == 'offline')
    }


@router.websocket("/logs")
async def websocket_logs(websocket: WebSocket):
    """WebSocket 端點：實時日誌推送"""
    await manager.connect(websocket)
    
    # 發送歡迎訊息
    await websocket.send_json({
        "timestamp": "00:00:00.000",
        "level": "INFO",
        "name": "websocket",
        "message": "WebSocket 日誌推送已啟動",
        "pathname": "server",
        "lineno": 0
    })
    
    try:
        while True:
            # 保持連接活躍，接收心跳
            data = await websocket.receive_text()
            # 可選：處理來自客戶端的訊息
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception as e:
        logging.error(f"WebSocket 錯誤: {e}")
        await manager.disconnect(websocket)


@router.get("/system/info")
async def get_system_info():
    """取得系統詳細信息"""
    import platform
    import psutil
    from config import settings
    
    return {
        "platform": {
            "system": platform.system(),
            "release": platform.release(),
            "version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor(),
            "python_version": platform.python_version(),
        },
        "resources": {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent if platform.system() != 'Windows' else psutil.disk_usage('C:\\').percent,
        },
        "config": {
            "modbus_port": settings.modbus_port,
            "modbus_baudrate": settings.modbus_baudrate,
            "modbus_device_address": settings.modbus_device_address,
            "temp_poll_interval": settings.temp_poll_interval,
            "debug": settings.debug,
        }
    }


# 日誌處理器
class WebSocketLogHandler(logging.Handler):
    """自定義日誌處理器，將日誌推送到 WebSocket"""
    
    def __init__(self):
        super().__init__()
        self.loop = None
    
    def emit(self, record):
        try:
            log_entry = {
                "timestamp": self.format_time(record),
                "level": record.levelname,
                "name": record.name,
                "message": record.getMessage(),
                "pathname": f"{record.module}.py",
                "lineno": record.lineno,
            }
            
            # 取得或建立事件循環
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                # 如果沒有運行的事件循環，嘗試取得預設循環
                loop = asyncio.get_event_loop()
            
            # 在事件循環中排程廣播
            if loop and loop.is_running():
                asyncio.run_coroutine_threadsafe(
                    manager.broadcast(log_entry),
                    loop
                )
        except Exception as e:
            # 避免日誌處理器本身產生錯誤造成無限循環
            pass
    
    def format_time(self, record):
        from datetime import datetime
        dt = datetime.fromtimestamp(record.created)
        return dt.strftime('%H:%M:%S.%f')[:-3]  # 格式化為 HH:MM:SS.mmm


# 全局日誌處理器實例
_ws_log_handler = None


def setup_websocket_logging():
    """設置 WebSocket 日誌處理器"""
    global _ws_log_handler
    
    if _ws_log_handler is None:
        _ws_log_handler = WebSocketLogHandler()
        _ws_log_handler.setLevel(logging.DEBUG)
        
        # 添加到根日誌記錄器
        root_logger = logging.getLogger()
        root_logger.addHandler(_ws_log_handler)


def remove_websocket_logging():
    """移除 WebSocket 日誌處理器"""
    global _ws_log_handler
    
    if _ws_log_handler is not None:
        root_logger = logging.getLogger()
        root_logger.removeHandler(_ws_log_handler)
        _ws_log_handler = None
