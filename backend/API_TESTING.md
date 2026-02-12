# API 測試指南

本文檔提供常用 API 端點的測試範例。

## 環境準備

確保後端服務已啟動：
```bash
python main.py
# 或
./start.sh
```

服務預設運行於 `http://localhost:8000`

## 工具選擇

### 1. Swagger UI（推薦）
訪問 http://localhost:8000/docs 使用互動式 API 文檔

### 2. curl 命令行
```bash
# 設置基礎 URL
export API_BASE="http://localhost:8000"
```

### 3. httpie（更友好的 CLI）
```bash
pip install httpie
```

---

## 系統狀態 API

### 取得系統狀態
```bash
# curl
curl $API_BASE/api/system/status

# httpie
http GET localhost:8000/api/system/status
```

### 健康檢查
```bash
curl $API_BASE/api/health
```

---

## 飼養箱管理 API

### 取得所有飼養箱
```bash
curl $API_BASE/api/tanks
```

### 創建飼養箱
```bash
curl -X POST $API_BASE/api/tanks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "測試飼養箱",
    "description": "用於測試的飼養箱",
    "target_temp_min": 26.0,
    "target_temp_max": 30.0,
    "target_humidity_min": 50.0,
    "target_humidity_max": 70.0,
    "active": true
  }'

# httpie
http POST localhost:8000/api/tanks \
  name="測試飼養箱" \
  description="用於測試的飼養箱" \
  target_temp_min:=26.0 \
  target_temp_max:=30.0 \
  target_humidity_min:=50.0 \
  target_humidity_max:=70.0 \
  active:=true
```

### 更新飼養箱
```bash
curl -X PATCH $API_BASE/api/tanks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "target_temp_min": 28.0,
    "target_temp_max": 32.0
  }'
```

### 取得單個飼養箱
```bash
curl $API_BASE/api/tanks/1
```

---

## 繼電器控制 API

### 取得所有繼電器
```bash
curl $API_BASE/api/relays
```

### 取得繼電器狀態
```bash
curl $API_BASE/api/relays/status/all
```

### 控制單個繼電器

#### 開啟繼電器
```bash
curl -X POST $API_BASE/api/relays/1/control \
  -H "Content-Type: application/json" \
  -d '{"state": true, "manual": true}'

# httpie
http POST localhost:8000/api/relays/1/control \
  state:=true \
  manual:=true
```

#### 關閉繼電器
```bash
curl -X POST $API_BASE/api/relays/1/control \
  -H "Content-Type: application/json" \
  -d '{"state": false, "manual": true}'
```

### 切換繼電器狀態
```bash
curl -X POST $API_BASE/api/relays/1/toggle
```

### 清除手動覆寫
```bash
curl -X POST $API_BASE/api/relays/1/clear-override
```

### 關閉所有繼電器
```bash
curl -X POST $API_BASE/api/relays/control/all-off
```

### 創建繼電器配置
```bash
curl -X POST $API_BASE/api/relays \
  -H "Content-Type: application/json" \
  -d '{
    "channel": 10,
    "name": "測試繼電器",
    "description": "用於測試",
    "tank_id": 1,
    "device_type": "relay",
    "enabled": true
  }'
```

---

## 溫度監控 API

### 取得當前溫度
```bash
curl $API_BASE/api/temperature/current
```

### 取得感測器狀態
```bash
curl $API_BASE/api/temperature/sensors
```

### 取得溫度歷史
```bash
# 最近 24 小時
curl "$API_BASE/api/temperature/history/1?hours=24&limit=1000"

# 最近 7 天
curl "$API_BASE/api/temperature/history/1?hours=168"
```

### 取得最新溫度
```bash
curl $API_BASE/api/temperature/latest/1
```

### 取得溫度統計
```bash
# 最近 24 小時統計
curl "$API_BASE/api/temperature/statistics/1?hours=24"

# 最近一週統計
curl "$API_BASE/api/temperature/statistics/1?hours=168"
```

### 刪除舊數據
```bash
# 刪除 30 天前的數據
curl -X DELETE "$API_BASE/api/temperature/history/1?days=30"
```

---

## 排程管理 API

### 取得所有排程
```bash
curl $API_BASE/api/schedules
```

### 創建每日排程
```bash
curl -X POST $API_BASE/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "日光燈定時",
    "description": "每天 8:00-20:00 開啟日光燈",
    "relay_channel_id": 3,
    "schedule_type": "daily",
    "start_time": "08:00",
    "end_time": "20:00",
    "active": true,
    "priority": 10
  }'

# httpie
http POST localhost:8000/api/schedules \
  name="日光燈定時" \
  description="每天 8:00-20:00 開啟日光燈" \
  relay_channel_id:=3 \
  schedule_type="daily" \
  start_time="08:00" \
  end_time="20:00" \
  active:=true \
  priority:=10
```

### 創建週期排程
```bash
curl -X POST $API_BASE/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "週末加熱",
    "description": "週六日早上 10:00 開啟加熱",
    "relay_channel_id": 6,
    "schedule_type": "weekly",
    "days_of_week": "5,6",
    "start_time": "10:00",
    "active": true
  }'
```

### 創建 Cron 排程
```bash
curl -X POST $API_BASE/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "每 2 小時霧化",
    "relay_channel_id": 8,
    "schedule_type": "cron",
    "cron_expression": "0 */2 * * *",
    "active": true
  }'
```

### 更新排程
```bash
curl -X PATCH $API_BASE/api/schedules/1 \
  -H "Content-Type: application/json" \
  -d '{
    "start_time": "09:00",
    "end_time": "21:00"
  }'
```

### 啟用排程
```bash
curl -X POST $API_BASE/api/schedules/1/enable
```

### 停用排程
```bash
curl -X POST $API_BASE/api/schedules/1/disable
```

### 刪除排程
```bash
curl -X DELETE $API_BASE/api/schedules/1
```

### 取得排程任務狀態
```bash
curl $API_BASE/api/schedules/jobs/status
```

---

## 完整測試流程

### 1. 初始設置
```bash
# 創建飼養箱
TANK_ID=$(curl -s -X POST $API_BASE/api/tanks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "守宮飼養箱",
    "target_temp_min": 26.0,
    "target_temp_max": 30.0
  }' | jq -r '.id')

echo "飼養箱 ID: $TANK_ID"
```

### 2. 配置繼電器
```bash
# 取得繼電器列表
curl $API_BASE/api/relays | jq '.[0:3]'

# 測試控制
curl -X POST $API_BASE/api/relays/1/control \
  -H "Content-Type: application/json" \
  -d '{"state": true, "manual": true}'
```

### 3. 設置排程
```bash
# 創建日光燈排程
curl -X POST $API_BASE/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "日光燈",
    "relay_channel_id": 3,
    "schedule_type": "daily",
    "start_time": "08:00",
    "end_time": "20:00",
    "active": true
  }'
```

### 4. 監控溫度
```bash
# 查看當前溫度
curl $API_BASE/api/temperature/current | jq

# 查看統計
curl "$API_BASE/api/temperature/statistics/$TANK_ID?hours=1" | jq
```

### 5. 系統檢查
```bash
# 查看系統狀態
curl $API_BASE/api/system/status | jq

# 查看排程任務
curl $API_BASE/api/schedules/jobs/status | jq
```

---

## 使用 Python 腳本測試

```python
import requests

API_BASE = "http://localhost:8000"

# 取得系統狀態
response = requests.get(f"{API_BASE}/api/system/status")
print("系統狀態:", response.json())

# 控制繼電器
response = requests.post(
    f"{API_BASE}/api/relays/1/control",
    json={"state": True, "manual": True}
)
print("控制結果:", response.json())

# 取得溫度
response = requests.get(f"{API_BASE}/api/temperature/current")
print("當前溫度:", response.json())
```

---

## 常見問題

### 1. CORS 錯誤
確保 `.env` 中配置了正確的 CORS 來源：
```
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

### 2. 資料庫鎖定
如果遇到 "database is locked" 錯誤，確保沒有多個進程同時訪問資料庫。

### 3. 繼電器控制失敗
檢查：
- 是否在模擬模式（`simulation_mode=True`）
- 串口配置是否正確
- 設備是否正確連接

### 4. 排程不執行
檢查：
- 排程是否啟用（`active=True`）
- 繼電器是否處於手動覆寫模式
- 時間設置是否正確

---

## 進階測試

### 壓力測試
```bash
# 使用 Apache Bench
ab -n 1000 -c 10 http://localhost:8000/api/system/status

# 使用 wrk
wrk -t4 -c100 -d30s http://localhost:8000/api/temperature/current
```

### 自動化測試腳本
```bash
#!/bin/bash
# 自動測試腳本

echo "開始測試..."

# 測試所有端點
endpoints=(
  "/api/health"
  "/api/system/status"
  "/api/tanks"
  "/api/relays"
  "/api/temperature/current"
  "/api/schedules"
)

for endpoint in "${endpoints[@]}"; do
  echo -n "測試 $endpoint ... "
  status=$(curl -s -o /dev/null -w "%{http_code}" $API_BASE$endpoint)
  if [ $status -eq 200 ]; then
    echo "✓ OK"
  else
    echo "✗ 失敗 (狀態碼: $status)"
  fi
done

echo "測試完成"
```

儲存為 `test_api.sh`，執行：
```bash
chmod +x test_api.sh
./test_api.sh
```
