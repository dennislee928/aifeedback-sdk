# AI Feedback SDK - Windows PowerShell 安全測試腳本
# 專門為 Windows PowerShell 環境設計

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
    
    # TruffleHog
    if (-not (Test-Command "trufflehog")) {
        Write-ColorOutput "📦 安裝 TruffleHog..." $Cyan
        npm install -g trufflehog
    }
    
    # Snyk
    if (-not (Test-Command "snyk")) {
        Write-ColorOutput "📦 安裝 Snyk..." $Cyan
        npm install -g snyk
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
            if ($result) {
                Write-ColorOutput "錯誤詳情:" $Yellow
                Write-Host $result
            }
            return $false
        }
    } catch {
        Write-ColorOutput "❌ $TestName 執行錯誤: $($_.Exception.Message)" $Red
        return $false
    }
}

# 主程式開始
Write-ColorOutput "🛡️  AI Feedback SDK - Windows PowerShell 安全測試" $Blue
Write-ColorOutput "=================================================" $Blue

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
    Write-ColorOutput "請執行: .\scripts\security-test-windows.ps1 -Install" $Yellow
    exit 1
}

# 定義測試項目
$tests = @()
$availableTools = @()
$missingTools = @()

Write-ColorOutput "🔍 檢查可用工具..." $Cyan

# 基本 npm 安全測試 (總是可用)
$tests += @{
    Name = "NPM Audit"
    Command = "npm audit"
    Description = "檢查 npm 依賴套件安全漏洞"
}
$availableTools += "npm audit"

# Snyk 安全測試
if (Test-Command "snyk") {
    $tests += @{
        Name = "Snyk Security Test"
        Command = "snyk test"
        Description = "Snyk 安全漏洞掃描"
    }
    $availableTools += "snyk"
} else {
    $missingTools += "snyk"
}

# TruffleHog (跳過，因為在 Windows 上有問題)
Write-ColorOutput "⚠️  TruffleHog 在 Windows 環境中可能有問題，暫時跳過" $Yellow

# 顯示工具狀態
Write-ColorOutput "✅ 可用工具: $($availableTools -join ', ')" $Green
if ($missingTools.Count -gt 0) {
    Write-ColorOutput "⚠️  缺少工具: $($missingTools -join ', ')" $Yellow
    Write-ColorOutput "💡 提示: 執行 '.\scripts\security-test-windows.ps1 -Install' 安裝缺少的工具" $Cyan
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
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$reportFile = "$OutputDir/security-report-$timestamp.txt"

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$report = @"
# AI Feedback SDK 安全測試報告
生成時間: $(Get-Date)
測試環境: Windows PowerShell

## 測試結果摘要
"@

foreach ($result in $results) {
    $status = if ($result.Passed) { "✅ 通過" } else { "❌ 失敗" }
    $report += "`n- $($result.Name): $status"
}

$report | Out-File -FilePath $reportFile -Encoding UTF8
Write-ColorOutput "📊 報告已生成: $reportFile" $Green

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