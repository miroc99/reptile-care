# iOS PWA 全螢幕修復指南

## 問題說明
在 iOS PWA 中切換頁面時，出現帶有 X 按鈕的 In-App Browser（Safari View Controller），這代表 iOS 判定跳出了 PWA 的管轄範圍。

## 已修復的問題

### 1. 路徑一致性問題 ✅
**問題**：App.jsx 使用相對路徑，Layout.jsx 使用絕對路徑，導致路徑不匹配。

**修復前**：
```jsx
// App.jsx - 相對路徑
<Route path="dashboard" element={<Dashboard />} />
<Route path="control" element={<ManualControl />} />

// Layout.jsx - 絕對路徑
{ name: '手動控制', href: '/control', icon: ToggleRight }
```

**修復後**：
```jsx
// App.jsx - 統一使用絕對路徑
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/control" element={<ManualControl />} />

// Layout.jsx - 保持絕對路徑
{ name: '手動控制', href: '/control', icon: ToggleRight }
```

### 2. Workbox 路由處理 ✅
**問題**：Service Worker 可能將 SPA 路由視為 404，導致重新載入頁面。

**修復**：在 vite.config.js 中添加：
```javascript
workbox: {
  navigateFallback: '/index.html',          // SPA 路由總是返回 index.html
  navigateFallbackDenylist: [/^\/api/],     // API 請求除外
  cleanupOutdatedCaches: true               // 清除舊緩存
}
```

### 3. 行動端導航體驗優化 ✅
**新增功能**：點擊側邊欄連結後自動關閉（行動版）

```jsx
const handleNavigation = (e) => {
  if (window.innerWidth < 1024) {
    setSidebarOpen(false);
  }
};
```

## 測試步驟

### 方法 1：開發模式測試（推薦先測試）

1. **啟動開發服務器**：
```powershell
cd c:\Dev\reptile_care_sys\frontend
npm run dev
```

2. **在 iPhone 上訪問**（確保在同一網路）：
   - 開啟 Safari
   - 訪問 `http://<你的電腦IP>:3001`
   - 點擊「分享」→「加入主畫面」
   - 從主畫面開啟 App

3. **測試導航**：
   - ✅ 點擊側邊欄「手動控制」
   - ✅ 點擊「排程管理」
   - ✅ 點擊「飼養缸管理」
   - ✅ 點擊 Dashboard 中的缸卡片（進入詳情頁）
   - ✅ 點擊詳情頁的返回按鈕

4. **檢查是否出現**：
   - ❌ 左上角 X 按鈕
   - ❌ 上方網址列
   - ❌ Safari UI 元素

### 方法 2：生產模式測試（最終驗證）

1. **構建生產版本**：
```powershell
cd c:\Dev\reptile_care_sys\frontend
npm run build
```

2. **部署到 Cloudflare** 或使用本地預覽：
```powershell
npm run preview
```

3. **重要：在 iPhone 上重新安裝 PWA**：
   - 🔴 **刪除舊的 PWA 圖示**（長按 → 移除 App）
   - 🔴 **清除 Safari 瀏覽記錄**（設定 → Safari → 清除瀏覽記錄）
   - 重新訪問網站
   - 重新「加入主畫面」

4. 重複上述導航測試

## 可能仍需檢查的項目

### 如果問題持續存在：

1. **Cloudflare Access 設定**（你說先不測試這部分）：
   - Session Duration 是否太短
   - 是否有 API 請求返回 401/302

2. **檢查網路請求**：
   - 在 Mac/PC 上用 Safari 開發者工具
   - 查看是否有 301/302 Redirect

3. **iOS 版本**：
   - 確認 iOS 版本 >= 13.0

## 驗證清單

- [x] 所有路由使用絕對路徑
- [x] 所有導航使用 React Router（`<Link>` 或 `navigate()`）
- [x] 無原生 `<a href>` 標籤（外部連結除外）
- [x] 無 `window.location` 跳轉
- [x] Workbox 設定 `navigateFallback`
- [x] PWA manifest 設定正確
- [x] iOS meta 標籤完整

## 代碼檢查清單

### ✅ 正確的導航方式：
```jsx
// 使用 Link 組件
<Link to="/control">前往控制頁</Link>

// 使用 navigate hook
const navigate = useNavigate();
<button onClick={() => navigate('/control')}>前往控制頁</button>
```

### ❌ 錯誤的導航方式：
```jsx
// 原生 a 標籤
<a href="/control">前往控制頁</a>

// window.location
<button onClick={() => window.location.href = '/control'}>前往控制頁</button>
```

## 預期結果

修復後，在 iOS PWA 中：
- ✅ 所有頁面切換保持全螢幕
- ✅ 無 Safari UI 出現
- ✅ 流暢的單頁應用體驗
- ✅ 行動版點擊導航自動關閉側邊欄

## 參考資料

- [iOS PWA Scope 機制](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [Workbox Navigation Routing](https://developers.google.com/web/tools/workbox/modules/workbox-routing#how_to_register_a_navigation_route)
- [React Router v6 路由配置](https://reactrouter.com/en/main/start/tutorial)
