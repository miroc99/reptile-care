# 生產環境部署指南

## 快速開始

### Windows
```powershell
cd c:\Dev\reptile_care_sys\backend
.\deploy.bat
```

### Linux/macOS
```bash
cd /path/to/reptile_care_sys/backend
chmod +x deploy.sh
./deploy.sh
```

## 手動部署步驟

### 1. 構建前端
```powershell
cd c:\Dev\reptile_care_sys\frontend
npm run build
```

這將創建 `dist/` 資料夾，包含優化後的靜態文件。

### 2. 啟動後端
```powershell
cd c:\Dev\reptile_care_sys\backend
uv run python main.py
```

後端會自動檢測並提供前端靜態文件。

### 3. 訪問系統
- **前端**: http://localhost:8000
- **API 文檔**: http://localhost:8000/docs
- **健康檢查**: http://localhost:8000/api/health

## Cloudflare Tunnel 配置

### 配置文件示例
```yaml
tunnel: your-tunnel-id
credentials-file: /path/to/credentials.json

ingress:
  - hostname: reptile-care.miroc99.com
    service: http://localhost:8000
  - service: http_status:404
```

### 啟動 Tunnel
```powershell
cloudflared tunnel run your-tunnel-name
```

## 生產環境配置

### 環境變數
在 `backend/.env` 中設置：
```env
DEBUG=false
MODBUS_PORT=COM3
MODBUS_BAUDRATE=9600
MODBUS_DEVICE_ADDRESS=1
SIMULATION_MODE=false
```

### CORS 設定
修改 `backend/config.py` 中的 `cors_origins`：
```python
cors_origins: list = ["https://reptile-care.miroc99.com"]
```

## 系統服務化 (Linux)

### Systemd 服務文件
創建 `/etc/systemd/system/reptile-care.service`:
```ini
[Unit]
Description=Reptile Care System
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/reptile_care_sys/backend
ExecStart=/path/to/uv run python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 啟用服務
```bash
sudo systemctl daemon-reload
sudo systemctl enable reptile-care
sudo systemctl start reptile-care
sudo systemctl status reptile-care
```

## Windows 服務化

使用 NSSM (Non-Sucking Service Manager):

```powershell
# 下載 NSSM: https://nssm.cc/download
nssm install ReptileCare "C:\path\to\uv.exe" "run python main.py"
nssm set ReptileCare AppDirectory "C:\Dev\reptile_care_sys\backend"
nssm set ReptileCare DisplayName "爬蟲飼養環控系統"
nssm set ReptileCare Description "智能爬蟲飼養環境監控與控制系統"
nssm start ReptileCare
```

## 效能優化

### 1. 使用 Gunicorn (Linux/macOS)
```bash
pip install gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 2. 反向代理 (Nginx)
```nginx
server {
    listen 80;
    server_name reptile-care.example.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/dev/logs {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 安全建議

1. **限制開發者工具訪問**
   - 在 Cloudflare Access 中為 `/dev` 路徑添加額外驗證
   - 或在生產環境中禁用開發者路由

2. **啟用 HTTPS**
   - Cloudflare Tunnel 自動提供 HTTPS
   - 或使用 Let's Encrypt 證書

3. **資料庫備份**
   ```powershell
   # 定期備份 SQLite 資料庫
   copy backend\database.db backend\backups\database_%date:~0,10%.db
   ```

## 監控和日誌

### 查看日誌
```powershell
# Windows
Get-Content -Path "logs\app.log" -Wait

# Linux
tail -f logs/app.log
```

### 日誌輪替
安裝 `python-logging-loki` 將日誌發送到 Grafana Loki，或配置本地日誌輪替。

## 故障排除

### 前端無法載入
1. 檢查 `frontend/dist` 資料夾是否存在
2. 查看後端日誌中是否有 "提供前端靜態文件" 訊息
3. 確認 CORS 設定正確

### WebSocket 連接失敗
1. 如果使用反向代理，確保啟用 WebSocket 支援
2. 檢查 Cloudflare 設定是否允許 WebSocket

### 硬體控制無回應
1. 檢查 Modbus 串口配置
2. 確認硬體連接正常
3. 查看日誌中的 Modbus 錯誤訊息

## 更新部署

```powershell
# 1. 停止服務
# Windows: Ctrl+C 或停止 NSSM 服務
# Linux: sudo systemctl stop reptile-care

# 2. 拉取最新代碼
git pull

# 3. 重新構建和部署
.\deploy.bat  # Windows
./deploy.sh   # Linux
```

## 效能指標

生產環境建議監控：
- CPU 使用率 < 50%
- 記憶體使用率 < 70%
- API 回應時間 < 200ms
- WebSocket 連接數

可透過開發者控制台的系統信息面板查看即時資源使用情況。
