@echo off
chcp 65001 >nul
REM Windows 批次腳本 - 啟動後端服務

echo ========================================
echo   爬蟲飼養箱控制系統 - 後端啟動
echo ========================================
echo.

REM 檢查 uv 是否安裝
uv --version >nul 2>&1
if errorlevel 1 (
    echo [錯誤] 找不到 uv，請先安裝 uv
    echo [安裝] 執行: pip install uv
    echo [或訪問] https://github.com/astral-sh/uv
    pause
    exit /b 1
)

REM 檢查並同步依賴
echo [同步] 同步依賴套件...
uv sync

REM 檢查 .env 文件
if not exist ".env" (
    echo [提示] 找不到 .env 文件，從範本複製...
    copy .env.example .env
    echo [注意] 請檢查並修改 .env 配置！
)

echo.
echo ========================================
echo   啟動服務...
echo ========================================
echo.
echo [訪問] http://localhost:8000
echo [文檔] http://localhost:8000/docs
echo [停止] 按 Ctrl+C 停止服務
echo.

REM 啟動 FastAPI 服務
uv run python main.py

pause
