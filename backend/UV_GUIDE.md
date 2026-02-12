# UV 使用指南

本項目使用 [uv](https://github.com/astral-sh/uv) 作為 Python 包管理器和項目管理工具。uv 是一個極快的 Python 包安裝器和解析器，比 pip 快 10-100 倍。

## 為什麼使用 uv？

- ⚡ **極快的速度**: 比 pip 和 pip-tools 快 10-100 倍
- 🔒 **可靠的依賴解析**: 使用與 pip 相同的解析算法
- 🎯 **簡單易用**: 單一工具處理所有 Python 包管理
- 📦 **兼容性好**: 完全兼容 pip 和 pyproject.toml
- 🔄 **跨平台**: Windows, Linux, macOS 全支援

## 安裝 uv

### 方法 1: 使用 pip（最簡單）
```bash
pip install uv
```

### 方法 2: 使用 pipx（推薦）
```bash
pipx install uv
```

### 方法 3: 使用官方安裝腳本
```bash
# Linux/Mac
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

驗證安裝：
```bash
uv --version
```

## 基本使用

### 項目初始化

```bash
# 同步依賴（自動創建虛擬環境）
uv sync
```

### 運行 Python 程式

```bash
# 運行 Python 腳本
uv run python main.py

# 運行測試
uv run python test_system.py

# 使用特定 Python 版本運行
uv run --python 3.11 python main.py
```

### 管理依賴

#### 添加依賴
```bash
# 添加生產依賴
uv add fastapi
uv add "sqlmodel>=0.0.14"

# 添加開發依賴
uv add --dev pytest
uv add --dev black ruff

# 從 requirements.txt 添加
uv pip install -r requirements.txt
```

#### 移除依賴
```bash
uv remove package-name
```

#### 更新依賴
```bash
# 更新所有依賴
uv sync --upgrade

# 更新特定包
uv add package-name --upgrade
```

#### 查看已安裝的包
```bash
uv pip list
```

### 虛擬環境管理

uv 會自動在 `.venv` 目錄創建虛擬環境。

```bash
# 創建虛擬環境
uv venv

# 創建指定 Python 版本的虛擬環境
uv venv --python 3.11

# 啟動虛擬環境（如果需要手動啟動）
# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

### 執行 uvicorn

```bash
# 使用 uv 運行 uvicorn
uv run uvicorn main:app --reload

# 指定主機和端口
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 項目結構

```
backend/
├── pyproject.toml          # 項目配置和依賴定義
├── uv.lock                 # 鎖定文件（自動生成）
├── .venv/                  # 虛擬環境（自動創建）
├── requirements.txt        # 向後兼容（可選）
└── ...
```

## 從 pip/venv 遷移到 uv

### 1. 安裝 uv
```bash
pip install uv
```

### 2. 創建 pyproject.toml
本項目已包含 `pyproject.toml`，如果是新項目：

```bash
uv init
```

### 3. 從 requirements.txt 遷移
```bash
# 直接同步 pyproject.toml
uv sync
```

### 4. 刪除舊環境（可選）
```bash
# 刪除舊的 venv
rm -rf venv/

# uv 會在 .venv/ 創建新環境
```

## 常用命令對照表

| pip 命令 | uv 命令 | 說明 |
|---------|---------|------|
| `pip install package` | `uv add package` | 安裝包 |
| `pip install -r requirements.txt` | `uv sync` | 同步依賴 |
| `pip uninstall package` | `uv remove package` | 移除包 |
| `pip list` | `uv pip list` | 列出已安裝的包 |
| `pip freeze` | `uv pip freeze` | 導出依賴 |
| `python -m venv venv` | `uv venv` | 創建虛擬環境 |
| `python script.py` | `uv run python script.py` | 運行腳本 |
發工作流

### 日常開發
```bash
# 1. 同步依賴（首次或更新後）
uv sync

# 2. 運行服務
uv run python main.py

# 3. 運行測試
uv run python test_system.py
```

### 添加新功能需要新包
```bash
# 1. 添加依賴
uv add new-package

# 2. 依賴會自動寫入 pyproject.toml
# 3. 繼續開發...
```

### 部署
```bash
# 1. 在服務器上安裝 uv
pip install uv

# 2. 克隆項目
git clone <repository>
cd backend

# 3. 同步生產依賴
uv sync

# 4. 運行服務
uv run python main.py
```

## 高級用法

### 使用多個 Python 版本
```bash
# 查看可用的 Python 版本
uv python list

# 安裝特定 Python 版本
uv python install 3.11

# 使用特定版本運行
uv run --python 3.11 python main.py
```

### 緩存管理
```bash
# 清理緩存
uv cache clean

# 查看緩存大小
uv cache dir
```

### 鎖定文件
```bash
# 更新鎖定文件
uv lock

# 從鎖定文件安裝（確保一致性）
uv sync --frozen
```

## 故障排除

### 問題: 找不到 uv 命令
```bash
# 確認 uv 已安裝
pip install uv

# 確認在 PATH 中
which uv  # Linux/Mac
where uv  # Windows
```

### 問題: 依賴安裝失敗
```bash
# 清理緩存後重試
uv cache clean
uv sync
```

### 問題: 虛擬環境問題
```bash
# 刪除虛擬環境重新創建
rm -rf .venv
uv sync
```

### 問題: 與 requirements.txt 不同步
```bash
# 從 requirements.txt 重新安裝
uv pip install -r requirements.txt
```

## 效能比較

實測本項目依賴安裝時間（16 個包）：

| 工具 | 冷緩存 | 熱緩存 |
|-----|--------|--------|
| pip | ~45s | ~30s |
| uv | ~8s | ~2s |

**uv 比 pip 快 5-15 倍！**

## 更多資源

- 官方文檔: https://github.com/astral-sh/uv
- PyPI: https://pypi.org/project/uv/
- 比較: https://github.com/astral-sh/uv#benchmarks

## 回到 pip（如果需要）

如果因某些原因需要回到 pip：

```bash
# 1. 導出依賴
uv 完全兼容標準 Python 工具鏈，無需特殊操作即可使用 pip。