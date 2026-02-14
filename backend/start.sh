#!/bin/bash
# Linux/Mac 腳本 - 啟動後端服務

echo "========================================"
echo "  爬蟲飼養箱控制系統 - 後端啟動"
echo "========================================"
echo

# 檢查 uv 是否安裝
if ! command -v uv &> /dev/null; then
    echo "[錯誤] 找不到 uv，請先安裝 uv"
    echo "[安裝] 執行: pip install uv"
    echo "[或訪問] https://github.com/astral-sh/uv"
    exit 1
fi

# 檢查並同步依賴
echo "[同步] 同步依賴套件..."
uv sync

# 檢查 .env 文件
if [ ! -f ".env" ]; then
    echo "[提示] 找不到 .env 文件，從範本複製..."
    cp .env.example .env
    echo "[注意] 請檢查並修改 .env 配置！"
fi

echo
echo "========================================"
echo "  啟動服務..."
echo "========================================"
echo
echo "[訪問] http://localhost:8000"
echo "[文檔] http://localhost:8000/docs"
echo "[停止] 按 Ctrl+C 停止服務"
echo

# 啟動 FastAPI 服務
uv run python main.py
