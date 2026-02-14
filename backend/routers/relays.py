"""繼電器控制相關 API 路由"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel, Field
from database import get_session
from models import RelayChannel, EventLog
from services.modbus_controller import get_controller
from datetime import datetime

router = APIRouter(prefix="/api/relays", tags=["繼電器控制"])


# Pydantic 模型
class RelayChannelCreate(BaseModel):
    channel: int = Field(ge=0, le=15)
    name: str
    description: Optional[str] = None
    tank_id: Optional[int] = None
    device_type: str = "relay"
    enabled: bool = True


class RelayChannelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tank_id: Optional[int] = None
    device_type: Optional[str] = None
    enabled: Optional[bool] = None


class RelayControlRequest(BaseModel):
    state: bool
    manual: bool = True


class RelayResponse(BaseModel):
    id: int
    channel: int
    name: str
    description: Optional[str]
    tank_id: Optional[int]
    device_type: str
    current_state: bool
    manual_override: bool
    enabled: bool
    created_at: datetime
    updated_at: datetime


@router.get("", response_model=List[RelayResponse])
def get_all_relays(session: Session = Depends(get_session)):
    """取得所有繼電器通道配置"""
    relays = session.exec(select(RelayChannel)).all()
    return relays


@router.get("/{relay_id}", response_model=RelayResponse)
def get_relay(relay_id: int, session: Session = Depends(get_session)):
    """取得單個繼電器通道配置"""
    relay = session.get(RelayChannel, relay_id)
    if not relay:
        raise HTTPException(status_code=404, detail="繼電器通道不存在")
    return relay


@router.post("", response_model=RelayResponse)
def create_relay(
    relay: RelayChannelCreate,
    session: Session = Depends(get_session)
):
    """創建繼電器通道配置"""
    # 檢查通道是否已存在
    existing = session.exec(
        select(RelayChannel).where(RelayChannel.channel == relay.channel)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="該通道已存在")
    
    db_relay = RelayChannel(**relay.model_dump())
    session.add(db_relay)
    session.commit()
    session.refresh(db_relay)
    
    return db_relay


@router.patch("/{relay_id}", response_model=RelayResponse)
def update_relay(
    relay_id: int,
    relay_update: RelayChannelUpdate,
    session: Session = Depends(get_session)
):
    """更新繼電器通道配置"""
    relay = session.get(RelayChannel, relay_id)
    if not relay:
        raise HTTPException(status_code=404, detail="繼電器通道不存在")
    
    # 更新字段
    update_data = relay_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(relay, key, value)
    
    relay.updated_at = datetime.utcnow()
    session.add(relay)
    session.commit()
    session.refresh(relay)
    
    return relay


@router.delete("/{relay_id}")
def delete_relay(relay_id: int, session: Session = Depends(get_session)):
    """刪除繼電器通道配置"""
    relay = session.get(RelayChannel, relay_id)
    if not relay:
        raise HTTPException(status_code=404, detail="繼電器通道不存在")
    
    session.delete(relay)
    session.commit()
    
    return {"message": "繼電器通道已刪除"}


@router.post("/{relay_id}/control")
async def control_relay(
    relay_id: int,
    control: RelayControlRequest,
    session: Session = Depends(get_session)
):
    """控制繼電器開關"""
    relay = session.get(RelayChannel, relay_id)
    if not relay:
        raise HTTPException(status_code=404, detail="繼電器通道不存在")
    
    # 檢查是否啟用
    if not relay.enabled:
        raise HTTPException(status_code=400, detail="該繼電器通道未啟用")
    
    # 控制繼電器
    controller = get_controller()
    success = await controller.set_relay(relay.channel, control.state)
    
    if not success:
        raise HTTPException(status_code=500, detail="控制繼電器失敗")
    
    # 更新資料庫
    relay.current_state = control.state
    relay.manual_override = control.manual
    relay.updated_at = datetime.utcnow()
    session.add(relay)
    
    # 記錄事件
    event = EventLog(
        event_type="relay_control",
        severity="info",
        message=f"繼電器 {relay.name} (CH{relay.channel}) {'手動' if control.manual else '自動'}設為 {'ON' if control.state else 'OFF'}",
        related_entity_type="relay",
        related_entity_id=relay.id
    )
    session.add(event)
    session.commit()
    
    return {
        "success": True,
        "channel": relay.channel,
        "state": control.state,
        "message": f"繼電器 {relay.name} 已{'開啟' if control.state else '關閉'}"
    }


@router.post("/{relay_id}/toggle")
async def toggle_relay(relay_id: int, session: Session = Depends(get_session)):
    """切換繼電器狀態"""
    relay = session.get(RelayChannel, relay_id)
    if not relay:
        raise HTTPException(status_code=404, detail="繼電器通道不存在")
    
    if not relay.enabled:
        raise HTTPException(status_code=400, detail="該繼電器通道未啟用")
    
    # 切換狀態
    controller = get_controller()
    success = await controller.toggle_relay(relay.channel)
    
    if not success:
        raise HTTPException(status_code=500, detail="切換繼電器失敗")
    
    # 讀取新狀態
    new_state = await controller.read_relay_status(relay.channel)
    
    # 更新資料庫
    relay.current_state = new_state
    relay.manual_override = True
    relay.updated_at = datetime.utcnow()
    session.add(relay)
    session.commit()
    
    return {
        "success": True,
        "channel": relay.channel,
        "state": new_state,
        "message": f"繼電器 {relay.name} 已切換為 {'ON' if new_state else 'OFF'}"
    }


@router.post("/{relay_id}/clear-override")
def clear_manual_override(relay_id: int, session: Session = Depends(get_session)):
    """清除手動覆寫模式"""
    relay = session.get(RelayChannel, relay_id)
    if not relay:
        raise HTTPException(status_code=404, detail="繼電器通道不存在")
    
    relay.manual_override = False
    relay.updated_at = datetime.utcnow()
    session.add(relay)
    session.commit()
    
    return {"message": f"繼電器 {relay.name} 手動覆寫已清除"}


@router.get("/status/all")
async def get_all_relay_status():
    """取得所有繼電器的硬件狀態"""
    controller = get_controller()
    status = await controller.get_status_dict()
    return status


@router.post("/control/all-off")
async def turn_all_relays_off(session: Session = Depends(get_session)):
    """關閉所有繼電器"""
    controller = get_controller()
    success = await controller.set_all_relays(False)
    
    if not success:
        raise HTTPException(status_code=500, detail="關閉所有繼電器失敗")
    
    # 更新資料庫
    relays = session.exec(select(RelayChannel)).all()
    for relay in relays:
        relay.current_state = False
        relay.updated_at = datetime.utcnow()
        session.add(relay)
    
    # 記錄事件
    event = EventLog(
        event_type="relay_control",
        severity="warning",
        message="所有繼電器已關閉"
    )
    session.add(event)
    session.commit()
    
    return {"success": True, "message": "所有繼電器已關閉"}


@router.post("/control/clear-all-overrides")
def clear_all_manual_overrides(session: Session = Depends(get_session)):
    """清除所有繼電器的手動覆寫模式"""
    relays = session.exec(select(RelayChannel)).all()
    
    count = 0
    for relay in relays:
        if relay.manual_override:
            relay.manual_override = False
            relay.updated_at = datetime.utcnow()
            session.add(relay)
            count += 1
    
    # 記錄事件
    event = EventLog(
        event_type="relay_control",
        severity="info",
        message=f"已清除 {count} 個繼電器的手動覆寫模式，回到自動控制"
    )
    session.add(event)
    session.commit()
    
    return {"success": True, "message": f"已清除 {count} 個設備的手動覆寫模式", "count": count}


@router.post("/control/sync-schedules")
async def sync_schedule_states(session: Session = Depends(get_session)):
    """同步排程狀態 - 立即根據當前時間和排程規則更新所有繼電器狀態"""
    from models import Schedule
    from datetime import datetime, time as dt_time
    
    controller = get_controller()
    now = datetime.now()
    current_time = now.time()
    current_weekday = now.weekday()  # 0=週一, 6=週日
    
    # 獲取所有啟用的排程
    schedules = session.exec(select(Schedule).where(Schedule.active == True)).all()
    
    # 建立繼電器狀態字典
    relay_states = {}  # relay_channel_id -> should_be_on
    relay_schedules = {}  # relay_channel_id -> list of active schedules
    
    for schedule in schedules:
        # 檢查排程是否應該在當前時間生效
        should_activate = False
        
        if schedule.schedule_type == "daily":
            if schedule.start_time and schedule.end_time:
                start = dt_time.fromisoformat(schedule.start_time)
                end = dt_time.fromisoformat(schedule.end_time)
                
                # 檢查星期
                if schedule.days_of_week:
                    days = [int(d) for d in schedule.days_of_week.split(',')]
                    if current_weekday not in days:
                        continue
                
                # 檢查時間範圍
                if start <= end:
                    # 正常情況：如 08:00 - 20:00
                    should_activate = start <= current_time <= end
                else:
                    # 跨午夜情況：如 22:00 - 06:00
                    should_activate = current_time >= start or current_time <= end
        
        if should_activate:
            relay_id = schedule.relay_channel_id
            if relay_id not in relay_schedules:
                relay_schedules[relay_id] = []
            relay_schedules[relay_id].append(schedule)
            
            # 使用優先級決定狀態（優先級高的排程優先）
            if relay_id not in relay_states or schedule.priority > relay_schedules[relay_id][0].priority:
                relay_states[relay_id] = True
    
    # 更新繼電器狀態
    updated_count = 0
    relays = session.exec(select(RelayChannel)).all()
    
    for relay in relays:
        # 只更新非手動覆寫模式且已啟用的繼電器
        if not relay.manual_override and relay.enabled:
            target_state = relay_states.get(relay.id, False)
            
            if relay.current_state != target_state:
                # 更新硬體狀態
                success = await controller.set_relay(relay.channel, target_state)
                
                if success:
                    relay.current_state = target_state
                    relay.updated_at = datetime.utcnow()
                    session.add(relay)
                    updated_count += 1
    
    # 記錄事件
    event = EventLog(
        event_type="schedule_run",
        severity="info",
        message=f"排程同步完成，已更新 {updated_count} 個繼電器狀態"
    )
    session.add(event)
    session.commit()
    
    return {
        "success": True,
        "message": f"排程同步完成，已更新 {updated_count} 個設備",
        "updated_count": updated_count,
        "active_schedules": len(relay_schedules)
    }
