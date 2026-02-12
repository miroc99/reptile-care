"""溫度監控相關 API 路由"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, desc
from pydantic import BaseModel
from database import get_session
from models import TemperatureLog, Tank
from services.temperature_monitor import get_monitor_service
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/temperature", tags=["溫度監控"])


class TemperatureReading(BaseModel):
    sensor_id: str
    sensor_type: str
    temperature: float
    humidity: Optional[float]
    timestamp: str


class TemperatureLogResponse(BaseModel):
    id: int
    tank_id: int
    temperature: float
    humidity: Optional[float]
    sensor_id: Optional[str]
    timestamp: datetime


@router.get("/current", response_model=List[TemperatureReading])
async def get_current_temperatures():
    """取得當前所有感測器的溫度"""
    monitor = get_monitor_service()
    readings = await monitor.read_all_sensors()
    return readings


@router.get("/sensors")
async def get_sensor_status():
    """取得所有感測器狀態"""
    monitor = get_monitor_service()
    status = monitor.get_sensor_status()
    return status


@router.get("/history/{tank_id}", response_model=List[TemperatureLogResponse])
def get_temperature_history(
    tank_id: int,
    session: Session = Depends(get_session),
    hours: int = Query(24, description="查詢最近幾小時的數據"),
    limit: int = Query(1000, description="最多返回多少筆記錄")
):
    """取得飼養箱溫度歷史記錄"""
    # 計算時間範圍
    since = datetime.utcnow() - timedelta(hours=hours)
    
    # 查詢
    stmt = (
        select(TemperatureLog)
        .where(TemperatureLog.tank_id == tank_id)
        .where(TemperatureLog.timestamp >= since)
        .order_by(desc(TemperatureLog.timestamp))
        .limit(limit)
    )
    
    logs = session.exec(stmt).all()
    return logs


@router.get("/latest/{tank_id}", response_model=Optional[TemperatureLogResponse])
def get_latest_temperature(
    tank_id: int,
    session: Session = Depends(get_session)
):
    """取得飼養箱最新溫度"""
    stmt = (
        select(TemperatureLog)
        .where(TemperatureLog.tank_id == tank_id)
        .order_by(desc(TemperatureLog.timestamp))
        .limit(1)
    )
    
    log = session.exec(stmt).first()
    return log


@router.get("/statistics/{tank_id}")
def get_temperature_statistics(
    tank_id: int,
    session: Session = Depends(get_session),
    hours: int = Query(24, description="統計最近幾小時的數據")
):
    """取得溫度統計資料"""
    since = datetime.utcnow() - timedelta(hours=hours)
    
    stmt = (
        select(TemperatureLog)
        .where(TemperatureLog.tank_id == tank_id)
        .where(TemperatureLog.timestamp >= since)
    )
    
    logs = session.exec(stmt).all()
    
    if not logs:
        return {
            "tank_id": tank_id,
            "period_hours": hours,
            "count": 0,
            "min": None,
            "max": None,
            "avg": None
        }
    
    temperatures = [log.temperature for log in logs]
    
    return {
        "tank_id": tank_id,
        "period_hours": hours,
        "count": len(temperatures),
        "min": min(temperatures),
        "max": max(temperatures),
        "avg": sum(temperatures) / len(temperatures),
        "first_reading": logs[-1].timestamp,
        "last_reading": logs[0].timestamp
    }


@router.delete("/history/{tank_id}")
def delete_temperature_history(
    tank_id: int,
    session: Session = Depends(get_session),
    days: int = Query(30, description="刪除多少天前的數據")
):
    """刪除舊的溫度記錄"""
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    stmt = (
        select(TemperatureLog)
        .where(TemperatureLog.tank_id == tank_id)
        .where(TemperatureLog.timestamp < cutoff)
    )
    
    logs = session.exec(stmt).all()
    deleted_count = len(logs)
    
    for log in logs:
        session.delete(log)
    
    session.commit()
    
    return {
        "deleted_count": deleted_count,
        "cutoff_date": cutoff.isoformat()
    }
