# AI Feedback SDK - 安全測試配置

## 🛡️ 完整安全測試腳本

本專案整合了多種安全測試工具，提供全面的安全檢查功能。

### 📋 可用工具

| 工具 | 用途 | 狀態 |
|------|------|------|
| **npm audit** | NPM 依賴套件安全檢查 | ✅ 內建 |
| **Trunk** | 整合式代碼品質與安全檢查 | ✅ 已配置 |
| **OSV Scanner** | 開源漏洞資料庫掃描 | ✅ 已配置 |
| **TruffleHog** | 敏感資訊洩漏檢測 | ✅ 已配置 |
| **Checkov** | 基礎設施安全檢查 | ✅ 已配置 |
| **Snyk** | 商業安全漏洞掃描 | ⚠️ 有使用限制 |

### 🚀 快速開始

#### 1. 安裝安全工具
```bash
# Windows PowerShell
.\scripts\security-test.ps1 -Install

# Linux/macOS Bash
./scripts/security-test.sh --install
```

#### 2. 執行完整安全測試
```bash
# Windows PowerShell
.\scripts\security-test.ps1

# Linux/macOS Bash
./scripts/security-test.sh

# 或使用 npm 腳本
npm run security:all
```

#### 3. 快速測試（僅核心檢查）
```bash
# Windows PowerShell
.\scripts\security-test.ps1 -Quick

# Linux/macOS Bash
./scripts/security-test.sh --quick

# 或使用 npm 腳本
npm run security:ci
```

### 📝 NPM 腳本命令

| 命令 | 說明 |
|------|------|
| `npm run security:audit` | 執行 npm audit 檢查 |
| `npm run security:audit:fix` | 修復 npm audit 發現的問題 |
| `npm run security:trunk` | 執行 Trunk 安全檢查 |
| `npm run security:trunk:fix` | 執行 Trunk 檢查並自動修復 |
| `npm run security:osv` | 執行 OSV Scanner 掃描 |
| `npm run security:trufflehog` | 執行 TruffleHog 敏感資訊檢測 |
| `npm run security:checkov` | 執行 Checkov 基礎設施檢查 |
| `npm run security:all` | 執行所有安全測試 |
| `npm run security:ci` | CI/CD 環境安全測試 |
| `npm run precommit` | 提交前完整檢查 |

### 🔧 腳本參數

#### PowerShell 腳本參數
- `-Quick`: 快速測試模式
- `-Fix`: 自動修復問題
- `-Install`: 安裝必要工具
- `-CI`: CI/CD 模式
- `-OutputDir`: 指定報告輸出目錄

#### Bash 腳本參數
- `--quick`: 快速測試模式
- `--fix`: 自動修復問題
- `--install`: 安裝必要工具
- `--ci`: CI/CD 模式
- `--output-dir`: 指定報告輸出目錄

### 📊 測試報告

所有測試結果會自動生成報告，儲存在 `security-reports/` 目錄中：

```
security-reports/
├── security-report-2024-01-15_14-30-25.txt
├── security-report-2024-01-15_15-45-12.txt
└── ...
```

### 🔄 CI/CD 整合

專案已配置 GitHub Actions 工作流程，自動執行安全測試：

- **推送/PR**: 觸發基本安全檢查
- **每週排程**: 執行完整安全掃描
- **依賴檢查**: PR 時檢查依賴套件安全

### ⚠️ 注意事項

1. **Snyk 限制**: 免費版每月有測試次數限制
2. **工具安裝**: 首次使用需要安裝額外工具
3. **權限要求**: 某些工具可能需要管理員權限
4. **網路連線**: 部分工具需要網路連線下載漏洞資料庫

### 🆘 故障排除

#### 常見問題

1. **工具未找到**
   ```bash
   # 解決方案：安裝工具
   npm run security:install
   ```

2. **權限不足**
   ```bash
   # Windows: 以管理員身份執行 PowerShell
   # Linux/macOS: 使用 sudo
   sudo ./scripts/security-test.sh --install
   ```

3. **Snyk 認證失敗**
   ```bash
   # 重新認證
   snyk auth
   ```

### 📈 最佳實踐

1. **定期執行**: 建議每週執行完整安全測試
2. **提交前檢查**: 使用 `npm run precommit` 確保代碼品質
3. **監控報告**: 定期檢查安全報告，及時修復問題
4. **依賴更新**: 定期更新依賴套件到最新版本
5. **CI/CD 整合**: 確保所有變更都通過安全檢查

### 🔗 相關資源

- [Trunk 官方文檔](https://docs.trunk.io/)
- [OSV Scanner 文檔](https://osv.dev/docs/)
- [TruffleHog 文檔](https://trufflesecurity.com/docs/)
- [Checkov 文檔](https://www.checkov.io/)
- [Snyk 文檔](https://docs.snyk.io/)
