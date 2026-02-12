"""FastAPI 主應用程式"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config import settings
from database import create_db_and_tables, engine, get_session
from models import RelayChannel, Tank
from services.modbus_controller import initialize_controller, shutdown_controller
from services.temperature_monitor import get_monitor_service
from services.scheduler import get_scheduler_service
from routers import relays, temperature, tanks, schedules
from routers import dev_tools
from sqlmodel import Session

# 配置日誌
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """應用程式生命週期管理"""
    logger.info("=" * 60)
    logger.info(f"啟動 {settings.app_name} v{settings.app_version}")
    logger.info("=" * 60)
    
    # 創建資料庫表
    logger.info("初始化資料庫...")
    create_db_and_tables()
    
    # 初始化預設資料
    with Session(engine) as session:
        await initialize_default_data(session)
    
    # 初始化 Modbus 控制器（模擬模式）
    logger.info("初始化 Modbus 控制器...")
    simulation_mode = True  # 設為 True 在無硬件時測試
    await initialize_controller(simulation_mode=simulation_mode)
    
    # 啟動溫度監控
    logger.info("啟動溫度監控服務...")
    temp_monitor = get_monitor_service(simulation_mode=simulation_mode)
    await temp_monitor.start()
    
    # 啟動排程器
    logger.info("啟動排程系統...")
    def session_factory():
        return Session(engine)
    
    scheduler = get_scheduler_service(session_factory)
    scheduler.start()
    
    # 載入所有排程
    with Session(engine) as session:
        await scheduler.load_all_schedules(session)
    
    # 設置 WebSocket 日誌
    logger.info("設置 WebSocket 日誌推送...")
    dev_tools.setup_websocket_logging()
    
    logger.info("✓ 系統啟動完成")
    
    yield
    
    # 關閉服務
    logger.info("關閉系統...")
    dev_tools.remove_websocket_logging()
    await temp_monitor.stop()
    scheduler.shutdown()
    await shutdown_controller()
    logger.info("✓ 系統已關閉")


async def initialize_default_data(session: Session):
    """初始化預設資料"""
    from sqlmodel import select
    
    # 檢查是否已有資料
    existing_tanks = session.exec(select(Tank)).first()
    if existing_tanks:
        logger.info("資料庫已有資料，跳過初始化")
        return
    
    logger.info("初始化預設資料...")
    
    # 創建預設飼養箱
    tank1 = Tank(
        name="主飼養箱",
        description="守宮飼養箱",
        target_temp_min=26.0,
        target_temp_max=30.0,
        target_humidity_min=50.0,
        target_humidity_max=70.0
    )
    session.add(tank1)
    session.commit()
    session.refresh(tank1)
    
    # 創建預設繼電器配置（基於 settings）
    relay_channels = settings.get_relay_channels()
    
    for channel, name in relay_channels.items():
        # 判斷設備類型
        device_type = "relay"
        if "加熱" in name:
            device_type = "heating"
        elif "燈" in name or "UVB" in name:
            device_type = "lighting"
        elif "霧化" in name:
            device_type = "humidifier"
        elif "風扇" in name:
            device_type = "fan"
        
        relay = RelayChannel(
            channel=channel,
            name=name,
            tank_id=tank1.id if channel < 10 else None,  # 前 10 個通道分配給主飼養箱
            device_type=device_type,
            enabled=True
        )
        session.add(relay)
    
    session.commit()
    logger.info(f"✓ 已創建 {len(relay_channels)} 個繼電器通道配置")


# 創建 FastAPI 應用
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="爬蟲寵物飼養箱自動化控制系統 - 基於 Modbus RTU 繼電器",
    lifespan=lifespan
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 註冊路由
app.include_router(relays.router)
app.include_router(temperature.router)
app.include_router(tanks.router)
app.include_router(dev_tools.router)
app.include_router(schedules.router)


@app.get("/")
def root():
    """根路徑"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/api/health")
def health_check():
    """健康檢查"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z"
    }


@app.get("/api/system/status")
async def get_system_status():
    """取得系統狀態"""
    from services.modbus_controller import get_controller
    
    controller = get_controller()
    temp_monitor = get_monitor_service()
    
    controller_status = await controller.get_status_dict()
    sensor_status = temp_monitor.get_sensor_status()
    
    return {
        "system": {
            "name": settings.app_name,
            "version": settings.app_version,
            "debug": settings.debug
        },
        "modbus_controller": controller_status,
        "temperature_sensors": sensor_status
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """全局異常處理"""
    logger.error(f"未處理的異常: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "內部伺服器錯誤"}
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info"
    )
