# AI Feedback SDK - 安全測試快速參考

## 🚀 一鍵執行命令

### Windows PowerShell
```powershell
# 完整安全測試
.\scripts\security-test.ps1

# 快速測試
.\scripts\security-test.ps1 -Quick

# 自動修復
.\scripts\security-test.ps1 -Fix

# 安裝工具
.\scripts\security-test.ps1 -Install
```

### Linux/macOS Bash
```bash
# 完整安全測試
./scripts/security-test.sh

# 快速測試
./scripts/security-test.sh --quick

# 自動修復
./scripts/security-test.sh --fix

# 安裝工具
./scripts/security-test.sh --install
```

### NPM 腳本
```bash
# 所有安全測試
npm run security:all

# CI/CD 測試
npm run security:ci

# 提交前檢查
npm run precommit

# 單一工具測試
npm run security:audit
npm run security:trunk
npm run security:osv
npm run security:trufflehog
npm run security:checkov
```

## 🔧 工具安裝

### 自動安裝
```bash
# Windows
.\scripts\security-test.ps1 -Install

# Linux/macOS
./scripts/security-test.sh --install
```

### 手動安裝
```bash
# 安裝所有工具
npm install -g osv-scanner trufflehog checkov snyk

# 安裝 Trunk
curl -fsSL https://get.trunk.io | bash
```

## 📊 測試結果

- ✅ **通過**: 沒有發現安全問題
- ❌ **失敗**: 發現安全問題，需要修復
- ⚠️ **警告**: 發現潛在問題，建議檢查

## 🆘 常見問題

| 問題 | 解決方案 |
|------|----------|
| 工具未找到 | 執行安裝腳本 |
| 權限不足 | 使用管理員權限 |
| Snyk 限制 | 等待下月或升級方案 |
| 網路問題 | 檢查網路連線 |

## 📈 建議流程

1. **開發階段**: 使用 `npm run security:audit`
2. **提交前**: 使用 `npm run precommit`
3. **定期檢查**: 使用完整測試腳本
4. **CI/CD**: 自動執行安全檢查
