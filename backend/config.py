"""應用配置"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """應用設定"""
    
    # 應用配置
    app_name: str = "Reptile Care System"
    app_version: str = "1.0.0"
    debug: bool = True
    
    # 資料庫
    database_url: str = "sqlite:///./reptile_care.db"
    
    # Modbus RTU 配置
    modbus_port: str = "COM3"
    modbus_baudrate: int = 9600
    modbus_parity: str = "N"
    modbus_stopbits: int = 1
    modbus_bytesize: int = 8
    modbus_timeout: int = 3
    modbus_device_address: int = 1
    
    # 繼電器通道配置
    relay_ch0: str = "加熱燈1"
    relay_ch1: str = "加熱燈2"
    relay_ch2: str = "UVB燈"
    relay_ch3: str = "日光燈1"
    relay_ch4: str = "日光燈2"
    relay_ch5: str = "夜燈"
    relay_ch6: str = "加熱墊1"
    relay_ch7: str = "加熱墊2"
    relay_ch8: str = "霧化器"
    relay_ch9: str = "風扇"
    relay_ch10: str = "備用1"
    relay_ch11: str = "備用2"
    relay_ch12: str = "備用3"
    relay_ch13: str = "備用4"
    relay_ch14: str = "備用5"
    relay_ch15: str = "備用6"
    
    # 溫度監控
    temp_poll_interval: int = 60
    temp_warning_low: float = 20.0
    temp_warning_high: float = 35.0
    
    # 安全設定
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000","http://reptile-care.miroc99.com"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    def get_relay_channels(self) -> dict:
        """取得所有繼電器通道配置"""
        return {
            i: getattr(self, f"relay_ch{i}")
            for i in range(16)
        }


settings = Settings()
