# 爬蟲飼養環控系統 - 前端

基於 React + Vite 建構的爬蟲飼養環控系統前端介面。

## 功能特色

### 🏠 飼養缸管理
- 多缸支持，每個缸獨立管理
- 自訂缸名稱和飼養物種
- 上傳缸照片作為識別
- 設定目標溫度範圍
- 配置每個缸的設備類型

### 📊 儀表板
- 所有飼養缸總覽
- 即時溫度監控與顯示
- 溫度異常警報統計
- 運行設備數量統計
- 點擊缸卡片進入詳細頁面

### 🔍 缸詳情頁面
- 單個缸的完整監控資訊
- 溫度與濕度趨勢圖表
- 設備即時狀態與控制
- 能耗統計與歷史
- 最近事件記錄

### 📅 排程管理
- 關聯到特定飼養缸
- 視覺化排程編輯器
- 支援每日/每週重複設定
- 設備開關時間設定
- 排程啟用/停用切換

### 🎮 手動控制
- 下拉選單選擇飼養缸
- 即時設備開關控制
- 覆寫模式（優先於自動排程）
- 目標溫度設定
- 操作歷史記錄

### 🔔 告警設定
- 溫度閾值設定（高溫/低溫警報）
- Email 通知整合
- Line Notify 整合
- Telegram Bot 整合
- 告警歷史查看

## 技術棧

- **框架**: React 18
- **建置工具**: Vite 5
- **PWA**: Vite Plugin PWA（支援離線使用和安裝到桌面）
- **樣式**: Tailwind CSS 3
- **路由**: React Router v6
- **圖表**: Recharts 2
- **圖示**: Lucide React

## 安裝與執行

### 前置需求
- Node.js 18+ 
- npm 或 yarn

### 安裝依賴

\`\`\`bash
cd frontend
npm install
\`\`\`

### 開發模式

\`\`\`bash
npm run dev
\`\`\`

應用程式將在 http://localhost:3000 啟動

### 建置生產版本

\`\`\`bash
npm run build
\`\`\`

建置檔案將輸出到 `dist/` 目錄

### 預覽生產版本

\`\`\`bash
npm run preview
\`\`\`

## PWA 功能

此應用程式已配置為 PWA（Progressive Web App），提供以下功能：

### 📱 在 iPhone/iPad 上安裝

1. 使用 Safari 瀏覽器開啟應用程式
2. 點擊底部的「分享」按鈕（<img src="https://developer.apple.com/design/human-interface-guidelines/images/share-icon.svg" width="16" style="display:inline"/>）
3. 向下滾動並選擇「加入主畫面」
4. 自訂名稱（預設：爬蟲環控）
5. 點擊「加入」

### ✨ PWA 特性

- ✅ **離線支援**：快取靜態資源，離線時仍可查看介面
- ✅ **全螢幕體驗**：隱藏瀏覽器 UI，提供原生應用程式般的體驗
- ✅ **安裝到主畫面**：在 iPhone、Android、桌面瀏覽器上安裝
- ✅ **自動更新**：新版本發布時自動更新快取
- ✅ **深色主題列**：iOS 狀態列支援

### 🎨 圖標生成

如需自訂圖標：

1. 在瀏覽器中開啟 `generate-icons.html`
2. 自動下載三個圖標文件
3. 將圖標移動到 `public/` 資料夾
4. 重新建置應用程式

或參考 `public/ICONS_README.md` 使用專業工具生成。

## API 整合

前端透過 Vite proxy 與後端 API 通訊：
- API 基礎路徑: `/api`
- 後端位址: `http://localhost:8000`

在 `vite.config.js` 中可以修改 proxy 設定。

## 專案結構

\`\`\`
frontend/
├── src/
│   ├── components/              # 共用元件
│   │   └── Layout.jsx          # 主要布局元件
│   ├── pages/                  # 頁面元件
│   │   ├── Dashboard.jsx       # 儀表板總覽（多缸）
│   │   ├── TankManagement.jsx  # 飼養缸管理
│   │   ├── TankDetail.jsx      # 單缸詳細頁面
│   │   ├── Schedule.jsx        # 排程管理（支援多缸）
│   │   ├── ManualControl.jsx   # 手動控制（支援缸選擇）
│   │   └── Alerts.jsx          # 告警設定
│   ├── App.jsx                 # 主應用程式（路由配置）
│   ├── main.jsx                # 進入點
│   └── index.css               # 全域樣式
├── index.html                  # HTML 模板
├── package.json                # 專案配置
├── vite.config.js              # Vite 配置
└── tailwind.config.js          # Tailwind 配置
\`\`\`

## 開發說明

### 添加新頁面
1. 在 `src/pages/` 建立新的元件檔案
2. 在 `src/App.jsx` 中添加路由
3. 在 `src/components/Layout.jsx` 的導航選單中添加連結

### 自訂樣式
使用 Tailwind CSS 工具類別，或在 `index.css` 中添加自訂樣式。

### API 呼叫
建議建立 `src/services/api.js` 來集中管理 API 呼叫邏輯。

## 後續開發建議

1. **API 整合**: 將模擬數據替換為真實 API 呼叫
2. **狀態管理**: 考慮使用 Zustand 或 Redux 管理全域狀態
3. **認證**: 實作使用者登入與 JWT 驗證
4. **即時更新**: 整合 WebSocket 或 Server-Sent Events
5. **響應式優化**: 針對平板和手機進行更多測試與優化
6. **國際化**: 添加多語言支援（i18n）
7. **測試**: 添加單元測試和整合測試

## License

MIT
