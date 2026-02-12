"""資料庫模型定義"""
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Tank(SQLModel, table=True):
    """飼養箱模型"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    target_temp_min: float = 25.0
    target_temp_max: float = 30.0
    target_humidity_min: Optional[float] = None
    target_humidity_max: Optional[float] = None
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class RelayChannel(SQLModel, table=True):
    """繼電器通道模型"""
    id: Optional[int] = Field(default=None, primary_key=True)
    channel: int = Field(index=True, ge=0, le=15)  # 0-15
    name: str
    description: Optional[str] = None
    tank_id: Optional[int] = Field(default=None, foreign_key="tank.id")
    device_type: str = "relay"  # relay, heating, lighting, humidifier, fan
    current_state: bool = False  # True=ON, False=OFF
    manual_override: bool = False  # 手動覆寫模式
    enabled: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Schedule(SQLModel, table=True):
    """排程模型"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    relay_channel_id: int = Field(foreign_key="relaychannel.id")
    schedule_type: str = "daily"  # daily, weekly, sunrise_sunset, temperature_based
    
    # 時間設定
    start_time: Optional[str] = None  # HH:MM
    end_time: Optional[str] = None  # HH:MM
    
    # 週期設定 (用於 weekly)
    days_of_week: Optional[str] = None  # "0,1,2,3,4,5,6" (0=週一)
    
    # Cron 表達式 (進階用途)
    cron_expression: Optional[str] = None
    
    # 溫度控制 (用於 temperature_based)
    temp_low: Optional[float] = None
    temp_high: Optional[float] = None
    
    active: bool = True
    priority: int = 0  # 優先級，數字越大優先級越高
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TemperatureLog(SQLModel, table=True):
    """溫度記錄模型"""
    id: Optional[int] = Field(default=None, primary_key=True)
    tank_id: int = Field(foreign_key="tank.id", index=True)
    temperature: float
    humidity: Optional[float] = None
    sensor_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)


class EventLog(SQLModel, table=True):
    """事件記錄模型"""
    id: Optional[int] = Field(default=None, primary_key=True)
    event_type: str = Field(index=True)  # relay_control, temperature_alert, schedule_run, system_error
    severity: str = "info"  # debug, info, warning, error, critical
    message: str
    details: Optional[str] = None  # JSON string
    related_entity_type: Optional[str] = None  # tank, relay, schedule
    related_entity_id: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)


class SystemStatus(SQLModel, table=True):
    """系統狀態模型"""
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(unique=True, index=True)
    value: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)
