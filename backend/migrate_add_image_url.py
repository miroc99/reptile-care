"""添加 image_url 欄位到 Tank 表"""
import sqlite3
from pathlib import Path

def migrate():
    # 資料庫路徑
    db_path = Path(__file__).parent / "reptile_care.db"
    
    if not db_path.exists():
        print("資料庫不存在，將在首次啟動時自動創建")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 檢查 image_url 欄位是否已存在
        cursor.execute("PRAGMA table_info(tank)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'image_url' not in columns:
            print("正在添加 image_url 欄位到 tank 表...")
            cursor.execute("ALTER TABLE tank ADD COLUMN image_url TEXT")
            conn.commit()
            print("✓ 成功添加 image_url 欄位")
        else:
            print("image_url 欄位已存在，無需遷移")
            
    except Exception as e:
        print(f"遷移失敗: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
