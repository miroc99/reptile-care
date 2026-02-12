# 生產環境配置完成 ✅

## 📦 已配置內容

### 1. 前端構建優化
- ✅ 生產環境構建配置 (vite.config.js)
- ✅ 代碼分割 (react-vendor, chart-vendor)
- ✅ 資源壓縮和優化
- ✅ PWA 離線支援
- ✅ Service Worker 配置

### 2. 後端靜態文件服務
- ✅ FastAPI 提供前端靜態文件
- ✅ SPA 路由處理
- ✅ API 和前端統一端口 (8000)
- ✅ PWA 資源路由 (manifest, service worker)

### 3. 部署腳本
- ✅ Windows: `deploy.bat`
- ✅ Linux/macOS: `deploy.sh`
- ✅ 自動構建 + 啟動

## 🚀 快速啟動

### 方式 1: 使用部署腳本（推薦）
```powershell
cd c:\Dev\reptile_care_sys\backend
.\deploy.bat
```

### 方式 2: 手動步驟
```powershell
# 1. 構建前端
cd c:\Dev\reptile_care_sys\frontend
npm run build

# 2. 啟動後端
cd c:\Dev\reptile_care_sys\backend
uv run python main.py
```

## 🌐 訪問地址

| 服務 | URL | 說明 |
|------|-----|------|
| **前端應用** | http://localhost:8000 | 完整的 React SPA |
| **API 文檔** | http://localhost:8000/docs | Swagger UI |
| **健康檢查** | http://localhost:8000/api/health | API 健康狀態 |
| **系統狀態** | http://localhost:8000/api/system/status | 完整系統信息 |

## ☁️ Cloudflare Tunnel 配置

現在只需要配置 Tunnel 指向單一端口：

```yaml
tunnel: your-tunnel-id
credentials-file: /path/to/credentials.json

ingress:
  - hostname: reptile-care.miroc99.com
    service: http://localhost:8000
    # 不需要額外的 CORS 配置，一切都在同一個域名下
  - service: http_status:404
```

### 優勢
- ✅ **無 CORS 問題**：前端和 API 在同一個域名
- ✅ **無需 Bypass 規則**：所有資源都經過統一認證
- ✅ **簡化配置**：只需配置一個服務
- ✅ **WebSocket 支援**：開發者日誌功能正常

## 📊 構建結果

最新構建輸出：
```
dist/registerSW.js                      0.13 kB
dist/manifest.webmanifest               0.44 kB
dist/index.html                         1.22 kB │ gzip:  0.63 kB
dist/assets/index-D6HWnWPW.css         25.40 kB │ gzip:  4.95 kB
dist/assets/index-BAZhcEFE.js          65.26 kB │ gzip: 15.14 kB
dist/assets/react-vendor-BSs_6TUE.js  161.29 kB │ gzip: 52.44 kB
dist/assets/chart-vendor-SJuBup-9.js  374.34 kB │ gzip: 97.88 kB
dist/sw.js                              - Service Worker
dist/workbox-1d305bb8.js               - Workbox Runtime
```

總計：14 個預緩存文件 (955.17 KiB)

## 🔧 環境配置

### 生產環境變數 (backend/.env)
```env
# 基本設定
DEBUG=false
APP_NAME="Reptile Care System"
APP_VERSION="1.0.0"

# Modbus 設定
MODBUS_PORT=COM3
MODBUS_BAUDRATE=9600
MODBUS_DEVICE_ADDRESS=1

# 開發時使用模擬模式，生產時設為 false
# simulation_mode 在 main.py 中設置

# CORS（生產環境只允許特定域名）
CORS_ORIGINS=["https://reptile-care.miroc99.com"]
```

### 修改模擬模式
編輯 [backend/main.py](backend/main.py):
```python
# 第 43 行
simulation_mode = False  # 連接實際硬體時改為 False
```

## 📱 PWA 功能

生產構建支援：
- ✅ 離線訪問
- ✅ 安裝到桌面/主螢幕
- ✅ 自動更新
- ✅ 快取策略優化
- ✅ 後台同步（Service Worker）

## 🔍 驗證部署

### 1. 檢查前端構建
```powershell
dir c:\Dev\reptile_care_sys\frontend\dist
# 應該看到 index.html, assets/, sw.js 等文件
```

### 2. 檢查後端日誌
啟動後應該看到：
```
INFO - 提供前端靜態文件: C:\Dev\reptile_care_sys\frontend\dist
INFO - ✓ 系統啟動完成
```

### 3. 測試訪問
```powershell
# 測試前端
curl http://localhost:8000

# 測試 API
curl http://localhost:8000/api/health
```

## 🐛 故障排除

### 問題: 白屏或 404
**原因**: 前端未構建或路徑錯誤

**解決**:
```powershell
cd c:\Dev\reptile_care_sys\frontend
npm run build
# 確認 dist 資料夾存在
```

### 問題: WebSocket 無法連接
**原因**: Cloudflare Access 未正確配置 WebSocket

**解決**: 確認 Cloudflare Tunnel 配置正確，WebSocket 會自動升級

### 問題: API 請求失敗
**原因**: 前端仍然請求錯誤的 API URL

**解決**: 確認前端 API 請求使用相對路徑 `/api/*`

## 📈 效能優化建議

### 1. 啟用 Gzip 壓縮
已在構建時啟用，Vite 自動優化

### 2. CDN 加速
Cloudflare 自動提供 CDN 和快取

### 3. 資料庫優化
```bash
# 定期清理舊日誌
sqlite3 database.db "DELETE FROM temperaturelog WHERE created_at < datetime('now', '-30 days');"
```

### 4. 監控資源使用
訪問開發者控制台查看：
- CPU 使用率
- 記憶體使用率
- 系統負載

## 🔐 安全建議

### 1. 限制開發者工具（生產環境）
編輯 `backend/main.py`，移除或限制 dev_tools 路由：
```python
# 註釋掉開發者工具路由
# app.include_router(dev_tools.router)
```

### 2. 啟用 HTTPS
Cloudflare Tunnel 自動提供 HTTPS

### 3. 資料庫備份
```powershell
# 每日備份
$date = Get-Date -Format "yyyy-MM-dd"
Copy-Item backend\database.db backend\backups\database_$date.db
```

## 📝 更新部署

當有代碼更新時：
```powershell
# 1. 停止服務 (Ctrl+C)

# 2. 拉取更新
git pull

# 3. 重新部署
cd backend
.\deploy.bat
```

## ✅ 下一步

1. **本地測試**: 訪問 http://localhost:8000 確認功能正常
2. **配置 Cloudflare Tunnel**: 指向 `http://localhost:8000`
3. **測試遠程訪問**: 訪問 https://reptile-care.miroc99.com
4. **連接硬體**: 設置 `simulation_mode = False` 並配置串口
5. **監控系統**: 定期檢查開發者控制台的系統狀態

## 📚 相關文檔

- [完整部署指南](DEPLOYMENT.md)
- [API 文檔](http://localhost:8000/docs)
- [前端開發](frontend/README.md)

---

**當前狀態**: ✅ 生產環境已配置完成，可以部署！
