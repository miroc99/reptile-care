"""事件日誌和告警 API 路由"""

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select, col
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_session
from models import EventLog

router = APIRouter(
    prefix="/api/events",
    tags=["events"],
)


@router.get("/", response_model=List[dict])
async def get_events(
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    """
    獲取事件日誌列表
    
    - **event_type**: 事件類型過濾 (relay_control, temperature_alert, schedule_run, system_error)
    - **severity**: 嚴重性過濾 (debug, info, warning, error, critical)
    - **limit**: 返回數量限制
    - **offset**: 偏移量
    """
    query = select(EventLog).order_by(col(EventLog.timestamp).desc())
    
    if event_type:
        query = query.where(EventLog.event_type == event_type)
    
    if severity:
        query = query.where(EventLog.severity == severity)
    
    query = query.limit(limit).offset(offset)
    
    events = session.exec(query).all()
    
    return [
        {
            "id": event.id,
            "event_type": event.event_type,
            "severity": event.severity,
            "message": event.message,
            "details": event.details,
            "related_entity_type": event.related_entity_type,
            "related_entity_id": event.related_entity_id,
            "timestamp": event.timestamp.isoformat(),
        }
        for event in events
    ]


@router.get("/alerts", response_model=List[dict])
async def get_alerts(
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    """
    獲取告警列表（只包含 warning, error, critical 級別的事件）
    """
    query = (
        select(EventLog)
        .where(col(EventLog.severity).in_(["warning", "error", "critical"]))
        .order_by(col(EventLog.timestamp).desc())
        .limit(limit)
        .offset(offset)
    )
    
    events = session.exec(query).all()
    
    return [
        {
            "id": event.id,
            "type": event.severity,  # warning, error, critical
            "message": event.message,
            "details": event.details,
            "event_type": event.event_type,
            "related_entity_type": event.related_entity_type,
            "related_entity_id": event.related_entity_id,
            "timestamp": event.timestamp.isoformat(),
            "time": event.timestamp.strftime("%Y-%m-%d %H:%M"),
            # 判斷是否已解決 (超過 24 小時的告警視為已解決)
            "resolved": (datetime.utcnow() - event.timestamp) > timedelta(hours=24),
        }
        for event in events
    ]


@router.get("/alerts/active", response_model=List[dict])
async def get_active_alerts(
    limit: int = 10,
    session: Session = Depends(get_session),
):
    """
    獲取活躍的告警（最近 24 小時內的 warning, error, critical 級別事件）
    """
    cutoff_time = datetime.utcnow() - timedelta(hours=24)
    
    query = (
        select(EventLog)
        .where(col(EventLog.severity).in_(["warning", "error", "critical"]))
        .where(EventLog.timestamp >= cutoff_time)
        .order_by(col(EventLog.timestamp).desc())
        .limit(limit)
    )
    
    events = session.exec(query).all()
    
    return [
        {
            "id": event.id,
            "type": event.severity,
            "message": event.message,
            "details": event.details,
            "event_type": event.event_type,
            "related_entity_type": event.related_entity_type,
            "related_entity_id": event.related_entity_id,
            "timestamp": event.timestamp.isoformat(),
            "time": event.timestamp.strftime("%Y-%m-%d %H:%M"),
            "resolved": False,  # 活躍告警都是未解決的
        }
        for event in events
    ]


@router.get("/stats", response_model=dict)
async def get_event_stats(
    session: Session = Depends(get_session),
):
    """
    獲取事件統計資訊
    """
    cutoff_time = datetime.utcnow() - timedelta(hours=24)
    
    # 最近 24 小時活躍告警數量
    active_alerts = session.exec(
        select(EventLog)
        .where(col(EventLog.severity).in_(["warning", "error", "critical"]))
        .where(EventLog.timestamp >= cutoff_time)
    ).all()
    
    # 按嚴重性分類
    critical_count = len([e for e in active_alerts if e.severity == "critical"])
    error_count = len([e for e in active_alerts if e.severity == "error"])
    warning_count = len([e for e in active_alerts if e.severity == "warning"])
    
    # 按事件類型分類
    temp_alerts = len([e for e in active_alerts if e.event_type == "temperature_alert"])
    relay_issues = len([e for e in active_alerts if e.event_type == "relay_control"])
    system_errors = len([e for e in active_alerts if e.event_type == "system_error"])
    
    return {
        "total_active_alerts": len(active_alerts),
        "by_severity": {
            "critical": critical_count,
            "error": error_count,
            "warning": warning_count,
        },
        "by_type": {
            "temperature_alert": temp_alerts,
            "relay_control": relay_issues,
            "system_error": system_errors,
        },
        "period": "last_24h",
    }


@router.delete("/{event_id}")
async def delete_event(
    event_id: int,
    session: Session = Depends(get_session),
):
    """
    刪除事件日誌
    """
    event = session.get(EventLog, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="事件不存在")
    
    session.delete(event)
    session.commit()
    
    return {"success": True, "message": "事件已刪除"}


@router.delete("/")
async def clear_old_events(
    days: int = 30,
    session: Session = Depends(get_session),
):
    """
    清理舊事件日誌
    
    - **days**: 刪除多少天之前的事件 (預設 30 天)
    """
    cutoff_time = datetime.utcnow() - timedelta(days=days)
    
    old_events = session.exec(
        select(EventLog).where(EventLog.timestamp < cutoff_time)
    ).all()
    
    count = len(old_events)
    
    for event in old_events:
        session.delete(event)
    
    session.commit()
    
    return {
        "success": True,
        "message": f"已刪除 {count} 條 {days} 天前的事件",
        "deleted_count": count,
    }
