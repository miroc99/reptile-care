# PWA 圖標說明

## 需要的圖標文件

為了完整的 PWA 支援，特別是在 iOS 上，需要以下圖標：

### 1. pwa-192x192.png
- 尺寸: 192x192 像素
- 用途: Android PWA 圖標

### 2. pwa-512x512.png
- 尺寸: 512x512 像素
- 用途: Android PWA 圖標和啟動畫面

### 3. apple-touch-icon.png
- 尺寸: 180x180 像素
- 用途: iOS 主畫面圖標

### 4. mask-icon.svg (可選)
- 格式: SVG
- 用途: Safari 固定標籤圖標

## 如何創建圖標

### 選項 1: 使用線上工具
1. 訪問 https://realfavicongenerator.net/
2. 上傳 `icon.svg` 或設計的圖標
3. 配置 iOS、Android 等設定
4. 下載生成的圖標包

### 選項 2: 使用 ImageMagick 命令行
\`\`\`bash
# 從 SVG 生成 PNG（需要先安裝 ImageMagick）
magick icon.svg -resize 192x192 pwa-192x192.png
magick icon.svg -resize 512x512 pwa-512x512.png
magick icon.svg -resize 180x180 apple-touch-icon.png
\`\`\`

### 選項 3: 使用線上 PNG 轉換器
1. 訪問 https://cloudconvert.com/svg-to-png
2. 上傳 icon.svg
3. 設定輸出尺寸
4. 下載並重命名

## 圖標設計建議

- 使用簡潔的設計，在小尺寸下也清晰可見
- 避免過多細節
- 使用高對比度的顏色
- 確保圖標在深色和淺色背景下都好看
- 為 maskable 圖標留出安全區域（中心 80% 區域）

## 當前狀態

✅ icon.svg - 已創建（蜥蜴與溫度計設計）
⏳ pwa-192x192.png - 需要生成
⏳ pwa-512x512.png - 需要生成
⏳ apple-touch-icon.png - 需要生成

## 臨時解決方案

在生成正式圖標前，系統會使用默認的 Vite 圖標。PWA 功能仍然可以正常運行，只是圖標可能不是最佳效果。
