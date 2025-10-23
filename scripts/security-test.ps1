# AI Feedback SDK - 完整安全測試腳本 (PowerShell)
# 整合所有可用的安全測試工具

param(
    [switch]$Quick,
    [switch]$Fix,
    [switch]$Install,
    [switch]$CI,
    [string]$OutputDir = "security-reports"
)

# 顏色定義
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Install-SecurityTools {
    Write-ColorOutput "🔧 安裝安全測試工具..." $Blue
    
    # 檢查並安裝 Node.js 工具
    if (Test-Command "npm") {
        Write-ColorOutput "📦 安裝 npm 安全工具..." $Cyan
        npm install -g osv-scanner trufflehog checkov 2>$null
    }
    
    # 檢查並安裝 Trunk
    if (-not (Test-Command "trunk")) {
        Write-ColorOutput "📥 安裝 Trunk CLI..." $Cyan
        # Windows 安裝指令
        Invoke-WebRequest -Uri "https://github.com/trunk-io/trunk/releases/latest/download/trunk-windows-x86_64.zip" -OutFile "trunk.zip"
        Expand-Archive -Path "trunk.zip" -DestinationPath "."
        Move-Item "trunk.exe" "C:\Windows\System32\" -Force
        Remove-Item "trunk.zip"
    }
    
    Write-ColorOutput "✅ 工具安裝完成" $Green
}

function Run-SecurityTest {
    param([string]$TestName, [string]$Command, [string]$Description)
    
    Write-ColorOutput "🔍 執行: $TestName" $Blue
    Write-ColorOutput "   $Description" $Cyan
    
    try {
        $result = Invoke-Expression $Command 2>&1
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-ColorOutput "✅ $TestName 通過" $Green
            return $true
        } else {
            Write-ColorOutput "❌ $TestName 失敗 (退出碼: $exitCode)" $Red
            Write-ColorOutput "錯誤詳情:" $Yellow
            Write-Host $result
            return $false
        }
    } catch {
        Write-ColorOutput "❌ $TestName 執行錯誤: $($_.Exception.Message)" $Red
        return $false
    }
}

function Generate-Report {
    param([array]$Results)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $reportFile = "$OutputDir/security-report-$timestamp.txt"
    
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
    
    $report = @"
# AI Feedback SDK 安全測試報告
生成時間: $(Get-Date)
測試環境: Windows PowerShell

## 測試結果摘要
"@
    
    foreach ($result in $Results) {
        $status = if ($result.Passed) { "✅ 通過" } else { "❌ 失敗" }
        $report += "`n- $($result.Name): $status"
    }
    
    $report | Out-File -FilePath $reportFile -Encoding UTF8
    Write-ColorOutput "📊 報告已生成: $reportFile" $Green
}

# 主程式開始
Write-ColorOutput "🛡️  AI Feedback SDK - 完整安全測試" $Blue
Write-ColorOutput "=====================================" $Blue

# 建立輸出目錄
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# 安裝工具
if ($Install) {
    Install-SecurityTools
    exit 0
}

# 檢查必要工具
$requiredTools = @("npm", "node")
$missingTools = @()

foreach ($tool in $requiredTools) {
    if (-not (Test-Command $tool)) {
        $missingTools += $tool
    }
}

if ($missingTools.Count -gt 0) {
    Write-ColorOutput "❌ 缺少必要工具: $($missingTools -join ', ')" $Red
    Write-ColorOutput "請執行: .\scripts\security-test.ps1 -Install" $Yellow
    exit 1
}

# 定義測試項目
$tests = @()

# 基本 npm 安全測試
$tests += @{
    Name = "NPM Audit"
    Command = "npm audit"
    Description = "檢查 npm 依賴套件安全漏洞"
}

# Trunk 安全檢查
if (Test-Command "trunk") {
    $trunkCommand = if ($Fix) { "trunk check --all --fix" } else { "trunk check --all" }
    $tests += @{
        Name = "Trunk Security Check"
        Command = $trunkCommand
        Description = "Trunk 整合安全檢查 (ESLint, OSV, TruffleHog, Checkov)"
    }
}

# OSV Scanner
if (Test-Command "osv-scanner") {
    $tests += @{
        Name = "OSV Scanner"
        Command = "osv-scanner --lockfile package-lock.json"
        Description = "開源漏洞資料庫掃描"
    }
}

# TruffleHog
if (Test-Command "trufflehog") {
    $tests += @{
        Name = "TruffleHog"
        Command = "trufflehog filesystem . --no-verification"
        Description = "檢測敏感資訊洩漏"
    }
}

# Checkov
if (Test-Command "checkov") {
    $tests += @{
        Name = "Checkov"
        Command = "checkov --directory . --framework npm"
        Description = "基礎設施安全檢查"
    }
}

# Snyk (如果可用且未達限制)
if (Test-Command "snyk") {
    $tests += @{
        Name = "Snyk Security Test"
        Command = "snyk test"
        Description = "Snyk 安全漏洞掃描"
    }
}

# 執行測試
$results = @()
$passedTests = 0
$totalTests = $tests.Count

Write-ColorOutput "`n🚀 開始執行 $totalTests 項安全測試..." $Blue

foreach ($test in $tests) {
    $passed = Run-SecurityTest -TestName $test.Name -Command $test.Command -Description $test.Description
    $results += @{
        Name = $test.Name
        Passed = $passed
        Description = $test.Description
    }
    
    if ($passed) {
        $passedTests++
    }
    
    Write-ColorOutput "" # 空行分隔
}

# 生成報告
Generate-Report -Results $results

# 總結
Write-ColorOutput "`n📊 測試完成摘要" $Blue
Write-ColorOutput "=================" $Blue
Write-ColorOutput "總測試數: $totalTests" $Cyan
Write-ColorOutput "通過測試: $passedTests" $Green
Write-ColorOutput "失敗測試: $($totalTests - $passedTests)" $Red

if ($passedTests -eq $totalTests) {
    Write-ColorOutput "`n🎉 所有安全測試通過！" $Green
    exit 0
} else {
    Write-ColorOutput "`n⚠️  發現安全問題，請檢查報告" $Yellow
    exit 1
}
