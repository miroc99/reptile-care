"""飼養箱管理相關 API 路由"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from database import get_session
from models import Tank
from datetime import datetime

router = APIRouter(prefix="/api/tanks", tags=["飼養箱管理"])


class TankCreate(BaseModel):
    name: str
    description: Optional[str] = None
    target_temp_min: float = 25.0
    target_temp_max: float = 30.0
    target_humidity_min: Optional[float] = None
    target_humidity_max: Optional[float] = None
    active: bool = True


class TankUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_temp_min: Optional[float] = None
    target_temp_max: Optional[float] = None
    target_humidity_min: Optional[float] = None
    target_humidity_max: Optional[float] = None
    active: Optional[bool] = None


class TankResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    target_temp_min: float
    target_temp_max: float
    target_humidity_min: Optional[float]
    target_humidity_max: Optional[float]
    active: bool
    created_at: datetime
    updated_at: datetime


@router.get("", response_model=List[TankResponse])
def get_all_tanks(session: Session = Depends(get_session)):
    """取得所有飼養箱"""
    tanks = session.exec(select(Tank)).all()
    return tanks


@router.get("/{tank_id}", response_model=TankResponse)
def get_tank(tank_id: int, session: Session = Depends(get_session)):
    """取得單個飼養箱"""
    tank = session.get(Tank, tank_id)
    if not tank:
        raise HTTPException(status_code=404, detail="飼養箱不存在")
    return tank


@router.post("", response_model=TankResponse)
def create_tank(tank: TankCreate, session: Session = Depends(get_session)):
    """創建飼養箱"""
    db_tank = Tank(**tank.model_dump())
    session.add(db_tank)
    session.commit()
    session.refresh(db_tank)
    return db_tank


@router.patch("/{tank_id}", response_model=TankResponse)
def update_tank(
    tank_id: int,
    tank_update: TankUpdate,
    session: Session = Depends(get_session)
):
    """更新飼養箱配置"""
    tank = session.get(Tank, tank_id)
    if not tank:
        raise HTTPException(status_code=404, detail="飼養箱不存在")
    
    update_data = tank_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tank, key, value)
    
    tank.updated_at = datetime.utcnow()
    session.add(tank)
    session.commit()
    session.refresh(tank)
    
    return tank


@router.delete("/{tank_id}")
def delete_tank(tank_id: int, session: Session = Depends(get_session)):
    """刪除飼養箱"""
    tank = session.get(Tank, tank_id)
    if not tank:
        raise HTTPException(status_code=404, detail="飼養箱不存在")
    
    session.delete(tank)
    session.commit()
    
    return {"message": "飼養箱已刪除"}
