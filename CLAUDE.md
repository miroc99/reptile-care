# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案簡介

爬蟲飼養環控系統（Reptile Care System）—— 整合硬體 IoT 裝置（Modbus RTU 繼電器、DS18B20 溫度感測器）的全端自動化控制平台。後端以 FastAPI 提供 API 並直接伺服前端靜態檔，透過單一 port 8000 對外。

---

## 開發指令

### 後端（Python / FastAPI）

使用 [UV](https://github.com/astral-sh/uv) 套件管理器（非 pip）。

```bash
cd backend

# 安裝依賴
uv sync

# 啟動開發伺服器（含硬體模擬，無需實體設備）
uv run python main.py

# 執行系統整合測試
uv run python test_system.py

# 執行單一測試（pytest）
uv run pytest test_system.py::TestModbusController -v
```

後端啟動後自動提供：
- API：`http://localhost:8000/api/...`
- Swagger UI：`http://localhost:8000/docs`
- 前端 SPA：`http://localhost:8000/`

### 前端（React / Vite）

```bash
cd frontend

# 安裝依賴
npm install

# 開發模式（proxy 到 localhost:8000/api）
npm run dev

# 建置（輸出至 frontend/dist/，後端會直接伺服此目錄）
npm run build

# 型別/語法檢查
npm run lint
```

> 前端生產建置後由後端 `main.py` 的靜態檔掛載直接提供，不需要額外的 web server。

---

## 架構總覽

### 整體架構

```
硬體層
  DS18B20 (1-Wire) ─── temperature_monitor.py
  Waveshare 16ch 繼電器 (Modbus RTU / RS485) ─── modbus_controller.py
        │
後端服務層 (backend/)
  main.py ─── FastAPI app（lifespan 啟動所有服務）
  services/
    modbus_controller.py   # 繼電器 on/off，支援模擬模式
    temperature_monitor.py # 背景輪詢感測器（預設 60s）
    scheduler.py           # APScheduler 排程任務管理
    device_control.py      # 排程 ↔ Modbus 整合層
  routers/                 # 各 domain 的 API 路由
  models.py                # SQLModel ORM（SQLite）
  config.py                # Pydantic Settings（從 .env 讀取）
        │
前端 SPA (frontend/src/)
  React 18 + React Router 6 + Tailwind CSS
  Dev proxy → localhost:8000/api
  生產模式由後端靜態伺服 dist/
```

### 服務初始化順序（`main.py` lifespan）

1. 建立 SQLite schema（`database.py`）
2. 初始化 `ModbusRelayController`（自動偵測 simulation 模式）
3. 初始化 `TemperatureMonitorService`（背景任務）
4. 初始化 `SchedulerService`（APScheduler，從資料庫載入排程）
5. 掛載靜態檔（`frontend/dist/`）與 SPA fallback

### 資料模型（`models.py`，SQLite + SQLModel）

| 模型 | 用途 |
|------|------|
| `Tank` | 飼養箱設定（目標溫濕度） |
| `RelayChannel` | 16 路繼電器狀態（channel 0–15） |
| `Schedule` | 排程（daily / weekly / cron / temperature-based） |
| `TemperatureLog` | 感測器歷史紀錄（timestamp indexed） |
| `EventLog` | 所有系統事件（繼電器操作、錯誤、告警） |
| `SystemStatus` | Key-value 系統狀態 |

### 排程系統（`services/scheduler.py`）

- 使用 `APScheduler` AsyncIOScheduler
- 每個排程的 `start_time` 和 `end_time` 各自建立獨立 APScheduler job
- 支援衝突優先級解析（priority 欄位）
- 排程執行後寫入 `EventLog`

### 硬體模擬模式

`ModbusRelayController` 和 `TemperatureMonitorService` 在偵測不到實體硬體時會自動切換至模擬模式，無需任何額外設定即可在開發環境執行。

---

## 環境設定

複製 `backend/.env.example` 為 `backend/.env`，主要參數：

```
MODBUS_PORT=COM3          # Windows RS485 串口（或 /dev/ttyUSB0 for Linux）
MODBUS_UNIT_ID=1
DATABASE_URL=sqlite:///./reptile_care.db
CORS_ORIGINS=http://localhost:5173
```

---

## 部署

- **Windows**：`backend/deploy.bat`（或 NSSM 服務）
- **Linux**：`backend/deploy.sh`（或 systemd service）
- **生產網域**：`reptile-care.miroc99.com`（Cloudflare Tunnel）
- 詳細說明見 `DEPLOYMENT.md`
