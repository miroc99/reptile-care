# Reptile Care System - 後端

爬蟲寵物飼養箱自動化控制系統後端，基於 FastAPI 和 Modbus RTU 繼電器。

## 功能特點

- **Modbus RTU 控制**: 支援 Waveshare 16 通道繼電器模組
- **溫度監控**: 支援 DS18B20 (1-Wire) 和模擬感測器
- **自動化排程**: 基於時間和溫度的設備控制
- **RESTful API**: 完整的 REST API 和 Swagger 文檔
- **模擬模式**: 無需實際硬件即可測試

## 快速開始

### 1. 安裝 uv

```bash
# 使用 pip 安裝
pip install uv

# 或使用 pipx（推薦）
pipx install uv

# 或訪問 https://github.com/astral-sh/uv
```

### 2. 同步依賴

```bash
# uv 會自動創建虛擬環境並安裝依賴
uv sync
```

### 3. 配置環境

複製 `.env.example` 為 `.env` 並修改配置：

```bash
cp .env.example .env
```

主要配置項：
- `MODBUS_PORT`: 串口端口 (Windows: COM3, Linux: /dev/ttyUSB0)
- `MODBUS_BAUDRATE`: 波特率 (默認 9600)
- `MODBUS_DEVICE_ADDRESS`: Modbus 設備地址 (默認 1)

### 4. 運行服務

```bash
# 使用 uv 運行（推薦）
uv run python main.py

# 或使用腳本
./start.sh        # Linux/Mac
start.bat         # Windows

# 或手動使用 uvicorn
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. 訪問 API 文檔

服務啟動後，訪問：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 項目結構

```
backend/
├── main.py                 # FastAPI 主應用
├── config.py              # 配置管理
├── database.py            # 資料庫連接
├── models.py              # 資料模型
├── requirements.txt       # Python 依賴
├── .env.example          # 環境配置範本
├── routers/              # API 路由
│   ├── relays.py        # 繼電器控制 API
│   ├── temperature.py   # 溫度監控 API
│   ├── tanks.py         # 飼養箱管理 API
│   └── schedules.py     # 排程管理 API
└── services/            # 業務邏輯服務
    ├── modbus_controller.py      # Modbus 繼電器控制
    ├── temperature_monitor.py    # 溫度監控服務
    ├── device_control.py         # 設備控制整合
    └── scheduler.py              # 排程系統
```

## API 端點

### 繼電器控制
- `GET /api/relays` - 取得所有繼電器
- `POST /api/relays/{id}/control` - 控制繼電器開關
- `POST /api/relays/{id}/toggle` - 切換繼電器狀態
- `POST /api/relays/control/all-off` - 關閉所有繼電器

### 溫度監控
- `GET /api/temperature/current` - 取得當前溫度
- `GET /api/temperature/history/{tank_id}` - 取得歷史記錄
- `GET /api/temperature/statistics/{tank_id}` - 取得統計資料

### 飼養箱管理
- `GET /api/tanks` - 取得所有飼養箱
- `POST /api/tanks` - 創建飼養箱
- `PATCH /api/tanks/{id}` - 更新飼養箱配置

### 排程管理
- `GET /api/schedules` - 取得所有排程
- `POST /api/schedules` - 創建排程
- `POST /api/schedules/{id}/enable` - 啟用排程
- `POST /api/schedules/{id}/disable` - 停用排程

## 模擬模式

在無實際硬件時，系統會自動使用模擬模式：

- **模擬繼電器**: 在記憶體中模擬繼電器狀態
- **模擬溫度**: 生成帶隨機波動的模擬溫度數據

要切換模式，修改 `main.py` 中的：

```python
simulation_mode = True  # False 時使用實際硬件
```

## Modbus RTU 配置

### 硬件連接

- Raspberry Pi: 使用 RS485 HAT 模組
- Windows/其他: 使用 USB-RS485 轉換器

### 繼電器控制指令

基於 Modbus RTU 協議：

- **功能碼 01**: 讀取繼電器狀態
- **功能碼 05**: 控制單個繼電器
- **功能碼 0F**: 控制多個繼電器

控制值：
- `0xFF00`: 開啟
- `0x0000`: 關閉
- `0x5500`: 翻轉

### 示例：控制繼電器 0

```python
from services.modbus_controller import get_controller

controller = get_controller()
await controller.connect()

# 開啟繼電器 0
await controller.set_relay(0, True)

# 關閉繼電器 0
await controller.set_relay(0, False)

# 讀取狀態
status = await controller.read_relay_status(0)
```

## 排程系統

支援多種排程類型：

### 每日排程
每天固定時間執行

```json
{
  "name": "日光燈定時",
  "schedule_type": "daily",
  "start_time": "08:00",
  "end_time": "20:00"
}
```

### 週期排程
每週特定日期執行

```json
{
  "name": "週末加熱",
  "schedule_type": "weekly",
  "days_of_week": "5,6",
  "start_time": "10:00"
}
```

### Cron 排程
自訂 Cron 表達式

```json
{
  "name": "複雜排程",
  "schedule_type": "cron",
  "cron_expression": "0 8,20 * * *"
}
```

## 溫度監控

### DS18B20 感測器

在 Linux 系統上啟用 1-Wire：

```bash
# 編輯 /boot/config.txt
dtoverlay=w1-gpio

# 重啟後檢查
ls /sys/bus/w1/devices/
```

### 添加感測器

```python
from services.temperature_monitor import get_monitor_service

monitor = get_monitor_service()

# 添加 DS18B20
monitor.add_sensor(
    sensor_id="28-xxxxxxxxxxxx",
    sensor_type="ds18b20"
)

# 或添加模擬感測器
monitor.add_sensor(
    sensor_id="tank1_hot",
    sensor_type="simulated",
    base_temp=28.0
)
```

## 安全注意事項

⚠️ **重要安全提示**

1. **用電安全**: 繼電器控制高壓電路，必須由專業人員安裝
2. **負載匹配**: 確認繼電器額定電流與負載匹配
3. **保護措施**: 建議加裝熔斷器或空氣開關
4. **斷電操作**: 維護前務必切斷電源
5. *使用 uv 運行

```bash
# 運行主程式
uv run python main.py

# 運行測試
uv run python test_system.py

# 運行特定 Python 版本
uv run --python 3.11 python main.py

# 添加新依賴
uv add package-name

# 移除依賴
uv remove package-name
```

### 查看日誌

```bash
# 運行時會輸出詳細日誌
uv run ### 查看日誌

```bash
# 運行時會輸出詳細日誌
python main.py
```

### 測試 API

使用 curl 或 httpie：

```bash
# 取得系統狀態
curl http://localhost:8000/api/system/status

# 控制繼電器
curl -X POST http://localhost:8000/api/relays/1/control \
  -H "Content-Type: application/json" \
  -d '{"state": true, "manual": true}'

# 取得當前溫度
curl http://localhost:8000/api/temperature/current
```

## 故障排除

### 無法連接 Modbus 設備

1. 檢查串口權限：`sudo chmod 666 /dev/ttyUSB0`
2. 確認設備地址和波特率正確
3. 檢查 RS485 線路連接 (A-A, B-B)
4. 加裝 120Ω 終端電阻

### 溫度讀取失敗

1. 檢查 1-Wire 模組是否載入
2. 確認感測器設備文件存在
3. 檢查感測器接線

### 排程不執行

1. 檢查排程是否啟用（`active=True`）
2. 確認繼電器未處於手動覆寫模式
3. 查看日誌中的錯誤信息

## 授權

MIT License

## 技術支持

如有問題，請查閱：
- 系統架構文檔: `docs/system_architecture.md`
- Modbus 控制器文檔: `docs/modbus_16channel_controller.md`
