"""排程系統服務"""
import asyncio
import logging
from typing import Optional, Dict, List
from datetime import datetime, time
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from sqlmodel import Session, select
from models import Schedule, RelayChannel, EventLog
from services.modbus_controller import get_controller

logger = logging.getLogger(__name__)


class SchedulerService:
    """排程系統服務
    
    負責：
    1. 管理定時任務
    2. 執行排程控制繼電器
    3. 處理衝突和優先級
    """
    
    def __init__(self, db_session_factory):
        """初始化排程器
        
        Args:
            db_session_factory: 資料庫 Session 工廠函數
        """
        self.scheduler = AsyncIOScheduler()
        self.db_session_factory = db_session_factory
        self._job_map: Dict[int, List[str]] = {}  # schedule_id -> [job_id_on, job_id_off]
        
        logger.info("SchedulerService 初始化")
    
    def start(self):
        """啟動排程器"""
        if not self.scheduler.running:
            self.scheduler.start()
            logger.info("排程器已啟動")
    
    def shutdown(self):
        """關閉排程器"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("排程器已關閉")
    
    async def load_all_schedules(self, session: Session):
        """從資料庫載入所有啟用的排程"""
        stmt = select(Schedule).where(Schedule.active == True)
        schedules = session.exec(stmt).all()
        
        for schedule in schedules:
            await self.add_schedule(schedule, session)
        
        logger.info(f"已載入 {len(schedules)} 個排程")
    
    async def add_schedule(self, schedule: Schedule, session: Session):
        """添加排程任務"""
        # 如果已存在，先移除
        if schedule.id in self._job_map:
            await self.remove_schedule(schedule.id)
        
        job_ids = []
        
        # 根據排程類型創建觸發器
        if schedule.schedule_type in ["daily", "weekly"]:
            # 為 start_time 和 end_time 分別創建任務
            if schedule.start_time:
                trigger_on = self._create_trigger(schedule, schedule.start_time)
                if trigger_on:
                    job_on = self.scheduler.add_job(
                        self._execute_schedule,
                        trigger=trigger_on,
                        args=[schedule.id, True],  # True 表示開啟
                        id=f"schedule_{schedule.id}_on",
                        name=f"{schedule.name} (開啟)",
                        replace_existing=True
                    )
                    job_ids.append(job_on.id)
                    logger.info(f"已添加排程 ON: {schedule.name} at {schedule.start_time}")
            
            if schedule.end_time:
                trigger_off = self._create_trigger(schedule, schedule.end_time)
                if trigger_off:
                    job_off = self.scheduler.add_job(
                        self._execute_schedule,
                        trigger=trigger_off,
                        args=[schedule.id, False],  # False 表示關閉
                        id=f"schedule_{schedule.id}_off",
                        name=f"{schedule.name} (關閉)",
                        replace_existing=True
                    )
                    job_ids.append(job_off.id)
                    logger.info(f"已添加排程 OFF: {schedule.name} at {schedule.end_time}")
        else:
            # 其他類型（interval, cron）的排程使用原有邏輯
            trigger = self._create_trigger_legacy(schedule)
            if trigger:
                job = self.scheduler.add_job(
                    self._execute_schedule,
                    trigger=trigger,
                    args=[schedule.id, None],  # None 表示自動判斷
                    id=f"schedule_{schedule.id}",
                    name=schedule.name,
                    replace_existing=True
                )
                job_ids.append(job.id)
                logger.info(f"已添加排程: {schedule.name} (ID: {schedule.id})")
        
        if job_ids:
            self._job_map[schedule.id] = job_ids
    
    async def remove_schedule(self, schedule_id: int):
        """移除排程任務"""
        if schedule_id in self._job_map:
            for job_id in self._job_map[schedule_id]:
                try:
                    self.scheduler.remove_job(job_id)
                except Exception as e:
                    logger.warning(f"移除任務 {job_id} 失敗: {e}")
            del self._job_map[schedule_id]
            logger.info(f"已移除排程 ID: {schedule_id}")
    
    def _create_trigger(self, schedule: Schedule, time_str: str):
        """為指定時間創建觸發器"""
        if not time_str:
            return None
        
        hour, minute = map(int, time_str.split(':'))
        
        if schedule.schedule_type == "daily":
            return CronTrigger(hour=hour, minute=minute)
        
        elif schedule.schedule_type == "weekly":
            if not schedule.days_of_week:
                return None
            days = schedule.days_of_week  # "0,1,2,3,4,5,6"
            return CronTrigger(
                day_of_week=days,
                hour=hour,
                minute=minute
            )
        
        return None
    
    def _create_trigger_legacy(self, schedule: Schedule):
        """創建其他類型的觸發器（保留原有邏輯）"""
        if schedule.schedule_type == "cron":
            if not schedule.cron_expression:
                return None
            
            parts = schedule.cron_expression.split()
            if len(parts) == 5:
                minute, hour, day, month, day_of_week = parts
                return CronTrigger(
                    minute=minute,
                    hour=hour,
                    day=day,
                    month=month,
                    day_of_week=day_of_week
                )
        
        elif schedule.schedule_type == "interval":
            if schedule.cron_expression and schedule.cron_expression.startswith("interval:"):
                params_str = schedule.cron_expression.replace("interval:", "")
                params = {}
                for param in params_str.split(','):
                    key, value = param.split('=')
                    params[key.strip()] = int(value.strip())
                
                return IntervalTrigger(**params)
        
        return None
    
    async def _execute_schedule(self, schedule_id: int, should_turn_on: Optional[bool] = None):
        """執行排程任務
        
        Args:
            schedule_id: 排程 ID
            should_turn_on: True=開啟, False=關閉, None=自動判斷
        """
        with self.db_session_factory() as session:
            try:
                # 查詢排程
                schedule = session.get(Schedule, schedule_id)
                if not schedule or not schedule.active:
                    logger.warning(f"排程 {schedule_id} 不存在或已停用")
                    return
                
                # 查詢關聯的繼電器
                relay = session.get(RelayChannel, schedule.relay_channel_id)
                if not relay:
                    logger.error(f"排程 {schedule_id} 關聯的繼電器不存在")
                    return
                
                # 檢查是否被手動覆寫
                if relay.manual_override:
                    logger.info(f"繼電器 {relay.name} 處於手動覆寫模式，跳過排程")
                    return
                
                # 檢查是否啟用
                if not relay.enabled:
                    logger.info(f"繼電器 {relay.name} 未啟用，跳過排程")
                    return
                
                # 如果 should_turn_on 為 None，使用舊的自動判斷邏輯
                if should_turn_on is None:
                    should_turn_on = self._auto_determine_state(schedule)
                
                # 執行排程動作
                await self._execute_schedule_action(schedule, relay, session, should_turn_on)
                
                # 記錄事件
                action = "開啟" if should_turn_on else "關閉"
                event = EventLog(
                    event_type="schedule_run",
                    severity="info",
                    message=f"排程 '{schedule.name}' 執行成功：{action} {relay.name}",
                    related_entity_type="schedule",
                    related_entity_id=schedule.id
                )
                session.add(event)
                session.commit()
                
            except Exception as e:
                logger.error(f"執行排程 {schedule_id} 時發生錯誤: {e}")
                
                # 記錄錯誤事件
                event = EventLog(
                    event_type="schedule_run",
                    severity="error",
                    message=f"排程 {schedule_id} 執行失敗: {str(e)}",
                    related_entity_type="schedule",
                    related_entity_id=schedule_id
                )
                session.add(event)
                session.commit()
    
    def _auto_determine_state(self, schedule: Schedule) -> bool:
        """自動判斷應該開啟還是關閉（用於舊邏輯）"""
        now = datetime.now().time()
        
        if schedule.start_time and schedule.end_time:
            start = time(*map(int, schedule.start_time.split(':')))
            end = time(*map(int, schedule.end_time.split(':')))
            
            if start <= end:
                # 正常時間範圍 (例如 08:00 - 20:00)
                return start <= now <= end
            else:
                # 跨午夜時間範圍 (例如 20:00 - 08:00)
                return now >= start or now <= end
        
        # 預設開啟
        return True
    
    async def _execute_schedule_action(
        self,
        schedule: Schedule,
        relay: RelayChannel,
        session: Session,
        should_turn_on: bool
    ):
        """執行排程動作"""
        controller = get_controller()
        
        # 執行控制
        success = await controller.set_relay(relay.channel, should_turn_on)
        
        if success:
            # 更新資料庫
            relay.current_state = should_turn_on
            relay.updated_at = datetime.utcnow()
            session.add(relay)
            session.commit()
            
            action = "開啟" if should_turn_on else "關閉"
            logger.info(f"排程 '{schedule.name}' 成功{action}繼電器 {relay.name}")
        else:
            logger.error(f"排程 '{schedule.name}' 控制繼電器失敗")
    
    def get_scheduled_jobs(self) -> List[Dict]:
        """取得所有排程任務狀態"""
        jobs = []
        
        for job in self.scheduler.get_jobs():
            jobs.append({
                "id": job.id,
                "name": job.name,
                "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                "trigger": str(job.trigger)
            })
        
        return jobs


# 全局排程器實例
_scheduler_service: Optional[SchedulerService] = None


def get_scheduler_service(db_session_factory) -> SchedulerService:
    """取得全局排程器實例"""
    global _scheduler_service
    if _scheduler_service is None:
        _scheduler_service = SchedulerService(db_session_factory)
    return _scheduler_service
