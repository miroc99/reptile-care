"""資料庫連接與初始化"""
from sqlmodel import SQLModel, create_engine, Session
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


def get_session():
    """取得資料庫 Session"""
    with Session(engine) as session:
        yield session
