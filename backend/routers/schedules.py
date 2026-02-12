"""排程管理相關 API 路由"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from database import get_session
from models import Schedule
from services.scheduler import get_scheduler_service
from datetime import datetime

router = APIRouter(prefix="/api/schedules", tags=["排程管理"])


class ScheduleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    relay_channel_id: int
    schedule_type: str = "daily"
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    days_of_week: Optional[str] = None
    cron_expression: Optional[str] = None
    temp_low: Optional[float] = None
    temp_high: Optional[float] = None
    active: bool = True
    priority: int = 0


class ScheduleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    relay_channel_id: Optional[int] = None
    schedule_type: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    days_of_week: Optional[str] = None
    cron_expression: Optional[str] = None
    temp_low: Optional[float] = None
    temp_high: Optional[float] = None
    active: Optional[bool] = None
    priority: Optional[int] = None


class ScheduleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    relay_channel_id: int
    schedule_type: str
    start_time: Optional[str]
    end_time: Optional[str]
    days_of_week: Optional[str]
    cron_expression: Optional[str]
    temp_low: Optional[float]
    temp_high: Optional[float]
    active: bool
    priority: int
    created_at: datetime
    updated_at: datetime


@router.get("", response_model=List[ScheduleResponse])
def get_all_schedules(session: Session = Depends(get_session)):
    """取得所有排程"""
    schedules = session.exec(select(Schedule)).all()
    return schedules


@router.get("/{schedule_id}", response_model=ScheduleResponse)
def get_schedule(schedule_id: int, session: Session = Depends(get_session)):
    """取得單個排程"""
    schedule = session.get(Schedule, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="排程不存在")
    return schedule


@router.post("", response_model=ScheduleResponse)
async def create_schedule(
    schedule: ScheduleCreate,
    session: Session = Depends(get_session)
):
    """創建排程"""
    db_schedule = Schedule(**schedule.model_dump())
    session.add(db_schedule)
    session.commit()
    session.refresh(db_schedule)
    
    # 如果啟用，添加到排程器
    if db_schedule.active:
        from database import engine
        from sqlmodel import Session as SessionClass
        
        def session_factory():
            return SessionClass(engine)
        
        scheduler = get_scheduler_service(session_factory)
        await scheduler.add_schedule(db_schedule, session)
    
    return db_schedule


@router.patch("/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(
    schedule_id: int,
    schedule_update: ScheduleUpdate,
    session: Session = Depends(get_session)
):
    """更新排程"""
    schedule = session.get(Schedule, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="排程不存在")
    
    update_data = schedule_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(schedule, key, value)
    
    schedule.updated_at = datetime.utcnow()
    session.add(schedule)
    session.commit()
    session.refresh(schedule)
    
    # 重新載入排程
    from database import engine
    from sqlmodel import Session as SessionClass
    
    def session_factory():
        return SessionClass(engine)
    
    scheduler = get_scheduler_service(session_factory)
    
    if schedule.active:
        await scheduler.add_schedule(schedule, session)
    else:
        await scheduler.remove_schedule(schedule.id)
    
    return schedule


@router.delete("/{schedule_id}")
async def delete_schedule(schedule_id: int, session: Session = Depends(get_session)):
    """刪除排程"""
    schedule = session.get(Schedule, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="排程不存在")
    
    # 從排程器移除
    from database import engine
    from sqlmodel import Session as SessionClass
    
    def session_factory():
        return SessionClass(engine)
    
    scheduler = get_scheduler_service(session_factory)
    await scheduler.remove_schedule(schedule.id)
    
    # 從資料庫刪除
    session.delete(schedule)
    session.commit()
    
    return {"message": "排程已刪除"}


@router.post("/{schedule_id}/enable")
async def enable_schedule(schedule_id: int, session: Session = Depends(get_session)):
    """啟用排程"""
    schedule = session.get(Schedule, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="排程不存在")
    
    schedule.active = True
    schedule.updated_at = datetime.utcnow()
    session.add(schedule)
    session.commit()
    
    # 添加到排程器
    from database import engine
    from sqlmodel import Session as SessionClass
    
    def session_factory():
        return SessionClass(engine)
    
    scheduler = get_scheduler_service(session_factory)
    await scheduler.add_schedule(schedule, session)
    
    return {"message": "排程已啟用"}


@router.post("/{schedule_id}/disable")
async def disable_schedule(schedule_id: int, session: Session = Depends(get_session)):
    """停用排程"""
    schedule = session.get(Schedule, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="排程不存在")
    
    schedule.active = False
    schedule.updated_at = datetime.utcnow()
    session.add(schedule)
    session.commit()
    
    # 從排程器移除
    from database import engine
    from sqlmodel import Session as SessionClass
    
    def session_factory():
        return SessionClass(engine)
    
    scheduler = get_scheduler_service(session_factory)
    await scheduler.remove_schedule(schedule.id)
    
    return {"message": "排程已停用"}


@router.get("/jobs/status")
def get_scheduled_jobs_status():
    """取得排程任務狀態"""
    from database import engine
    from sqlmodel import Session as SessionClass
    
    def session_factory():
        return SessionClass(engine)
    
    scheduler = get_scheduler_service(session_factory)
    jobs = scheduler.get_scheduled_jobs()
    
    return {
        "total_jobs": len(jobs),
        "jobs": jobs
    }
