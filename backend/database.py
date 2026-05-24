"""資料庫連接與初始化"""
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import text
from config import settings

# 建立資料庫引擎
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},  # SQLite 需要
    echo=settings.debug
)


def create_db_and_tables():
    """建立資料庫表格"""
    SQLModel.metadata.create_all(engine)
    ensure_schema_compatibility()


def ensure_schema_compatibility():
    """輕量級 schema 相容性修正（SQLite）"""
    # create_all 不會修改既有欄位，舊資料庫需補齊新增欄位
    if not settings.database_url.startswith("sqlite"):
        return

    with engine.begin() as conn:
        table_info = conn.execute(text("PRAGMA table_info(tank)")).fetchall()

        if not table_info:
            return

        columns = {row[1] for row in table_info}
        if "image_url" not in columns:
            conn.execute(text("ALTER TABLE tank ADD COLUMN image_url TEXT"))


def get_session():
    """取得資料庫 Session"""
    with Session(engine) as session:
        yield session
