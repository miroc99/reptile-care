@echo off
chcp 65001 > nul
echo ================================================
echo 構建和部署爬蟲飼養環控系統
echo ================================================
echo.

echo [1/3] 構建前端...
cd /d %~dp0..\frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo 錯誤: 前端構建失敗
    pause
    exit /b 1
)

echo.
echo [2/3] 檢查後端依賴...
cd /d %~dp0
uv sync
if %ERRORLEVEL% NEQ 0 (
    echo 錯誤: 後端依賴安裝失敗
    pause
    exit /b 1
)

echo.
echo [3/3] 啟動生產伺服器...
echo ================================================
echo 系統將運行在 http://0.0.0.0:8000
echo API 文檔: http://localhost:8000/docs
echo ================================================
echo.

uv run python main.py

pause
