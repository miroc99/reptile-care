## 系統架構概覽
- **控制器** Raspberry Pi 4/5 搭載 Raspberry Pi OS，透過 USB-RS485 轉換器連接 Modbus RTU 繼電器模組，GPIO 讀取本地安全訊號。
- **感測層** DS18B20 或 Modbus TCP/RTU 溫度探頭，以 1-Wire 或 RS485 匯流排回傳數據，支援多點溫度讀取與校正流程。
- **網路層** 有線乙太網為主、Wi-Fi 為備援，MQTT（可選）用於拓展遠端監控或多裝置同步。
- **儲存層** SQLite 保存排程、設備狀態、歷史溫度與事件；本地備份每日導出 JSON，預留掛載 NAS/雲端。

## 軟體技術細節
- **後端框架** Python FastAPI（RESTful API、Swagger），搭配 asyncio 管理 Modbus 請求；pymodbus 驅動繼電器；APScheduler/croniter 建時段與週期排程；SQLModel 管理 SQLite。
- **設備控制服務** 背景任務輪詢溫度，依排程與目標溫度範圍控制照明、加熱通道；支援手動覆寫與安全回復策略。
- **前端** 單頁式應用（React + Vite）或輕量模板（HTMX/Tailwind），儀表板顯示即時溫度、設備狀態；提供排程編輯、手動控制、告警通知設定。
- **通訊安全** 內網預設 HTTP，選配 Nginx + TLS；JWT 或 session 驗證；角色權限區分一般使用者與管理員。
- **排程系統** 視覺化設定每日/每週開關時間、日出日落模式、臨時覆寫；衝突檢測與執行紀錄；需支援自動切換夏令時間。
- **監控告警** Prometheus Node Exporter 或自建 Metrics Endpoint；溫度異常、排程失敗以 Email/Line Notify/Telegram 推播。
