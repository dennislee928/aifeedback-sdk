#!/bin/bash
# AI Feedback SDK - 完整安全測試腳本 (Bash)
# 整合所有可用的安全測試工具
# 版本: 2.0.0

set -euo pipefail

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 參數處理
QUICK=false
FIX=false
INSTALL=false
CI=false
VERBOSE=false
OUTPUT_DIR="security-reports"
SKIP_SNYK=false

# 顯示幫助信息
show_help() {
    cat << EOF
AI Feedback SDK - 安全測試腳本

用法: $0 [選項]

選項:
    --quick          快速測試模式 (僅執行核心檢查)
    --fix            自動修復問題
    --install        安裝安全測試工具
    --ci             CI/CD 模式 (減少輸出)
    --verbose        詳細輸出模式
    --skip-snyk      跳過 Snyk 測試
    --output-dir DIR 指定報告輸出目錄 (預設: security-reports)
    --help           顯示此幫助信息

範例:
    $0                    # 執行完整安全測試
    $0 --quick           # 快速測試
    $0 --install         # 安裝工具
    $0 --fix             # 自動修復問題
    $0 --ci --skip-snyk  # CI 模式，跳過 Snyk

EOF
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            QUICK=true
            shift
            ;;
        --fix)
            FIX=true
            shift
            ;;
        --install)
            INSTALL=true
            shift
            ;;
        --ci)
            CI=true
            VERBOSE=false
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --skip-snyk)
            SKIP_SNYK=true
            shift
            ;;
        --output-dir)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            print_color $RED "未知參數: $1"
            print_color $YELLOW "使用 --help 查看可用選項"
            exit 1
            ;;
    esac
done

# 工具函數
print_color() {
    local color=$1
    local message=$2
    if [ "$CI" = true ]; then
        echo "$message"
    else
        echo -e "${color}${message}${NC}"
    fi
}

print_verbose() {
    if [ "$VERBOSE" = true ]; then
        print_color $CYAN "🔍 [詳細] $1"
    fi
}

check_command() {
    command -v "$1" >/dev/null 2>&1
}

# 檢查是否在 Windows 環境中
is_windows() {
    case "$(uname -s)" in
        CYGWIN*|MINGW*|MSYS*)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# 安全的命令執行
safe_execute() {
    local cmd="$1"
    local description="$2"
    
    print_verbose "執行命令: $cmd"
    
    if eval "$cmd" 2>/dev/null; then
        return 0
    else
        local exit_code=$?
        print_verbose "命令失敗 (退出碼: $exit_code): $cmd"
        return $exit_code
    fi
}

install_security_tools() {
    print_color $BLUE "🔧 安裝安全測試工具..."
    
    # 檢查並安裝 Node.js 工具
    if check_command npm; then
        print_color $CYAN "📦 安裝 npm 安全工具..."
        
        # TruffleHog
        if ! check_command trufflehog; then
            print_color $CYAN "  安裝 TruffleHog..."
            npm install -g trufflehog 2>/dev/null || true
        fi
        
        # Snyk
        if ! check_command snyk; then
            print_color $CYAN "  安裝 Snyk..."
            npm install -g snyk 2>/dev/null || true
        fi
        
        # OSV Scanner (需要手動安裝)
        if ! check_command osv-scanner; then
            print_color $YELLOW "  OSV Scanner 需要手動安裝:"
            print_color $CYAN "    Windows: 下載 https://github.com/google/osv-scanner/releases"
            print_color $CYAN "    Linux/macOS: curl -L https://github.com/google/osv-scanner/releases/latest/download/osv-scanner_1.4.0_linux_amd64.tar.gz | tar xz"
        fi
        
        # Checkov (需要手動安裝)
        if ! check_command checkov; then
            print_color $YELLOW "  Checkov 需要手動安裝:"
            print_color $CYAN "    pip install checkov"
            print_color $CYAN "    或使用 Docker: docker run --rm -v \$(pwd):/src bridgecrew/checkov -d /src"
        fi
    fi
    
    # 檢查並安裝 Trunk
    if ! check_command trunk; then
        print_color $CYAN "📥 安裝 Trunk CLI..."
        # Linux/macOS 安裝指令
        curl -fsSL https://get.trunk.io | bash
    fi
    
    print_color $GREEN "✅ 工具安裝完成"
    print_color $CYAN "💡 提示: 某些工具可能需要手動安裝，請參考上述說明"
}

run_security_test() {
    local test_name=$1
    local command=$2
    local description=$3
    
    print_color $BLUE "🔍 執行: $test_name"
    print_color $CYAN "   $description"
    
    if eval "$command" 2>/dev/null; then
        print_color $GREEN "✅ $test_name 通過"
        return 0
    else
        print_color $RED "❌ $test_name 失敗"
        return 1
    fi
}

generate_report() {
    local results=("$@")
    local timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
    local report_file="$OUTPUT_DIR/security-report-$timestamp.txt"
    
    mkdir -p "$OUTPUT_DIR"
    
    cat > "$report_file" << EOF
# AI Feedback SDK 安全測試報告
生成時間: $(date)
測試環境: Bash/Unix

## 測試結果摘要
EOF
    
    for result in "${results[@]}"; do
        echo "- $result" >> "$report_file"
    done
    
    print_color $GREEN "📊 報告已生成: $report_file"
}

# 主程式開始
print_color $BLUE "🛡️  AI Feedback SDK - 完整安全測試"
print_color $BLUE "====================================="

# 建立輸出目錄
mkdir -p "$OUTPUT_DIR"

# 安裝工具
if [ "$INSTALL" = true ]; then
    install_security_tools
    exit 0
fi

# 檢查必要工具
required_tools=("npm" "node")
missing_tools=()

for tool in "${required_tools[@]}"; do
    if ! check_command "$tool"; then
        missing_tools+=("$tool")
    fi
done

if [ ${#missing_tools[@]} -gt 0 ]; then
    print_color $RED "❌ 缺少必要工具: ${missing_tools[*]}"
    print_color $YELLOW "請執行: ./scripts/security-test.sh --install"
    exit 1
fi

# 定義測試項目
declare -a tests=()
declare -a results=()
declare -a available_tools=()
declare -a missing_tools=()

print_color $CYAN "🔍 檢查可用工具..."

# 基本 npm 安全測試 (總是可用)
tests+=("NPM Audit|npm audit|檢查 npm 依賴套件安全漏洞")
available_tools+=("npm audit")

# Trunk 安全檢查
if check_command trunk; then
    trunk_cmd="trunk check --all"
    if [ "$FIX" = true ]; then
        trunk_cmd="trunk check --all --fix"
    fi
    tests+=("Trunk Security Check|$trunk_cmd|Trunk 整合安全檢查 (ESLint, OSV, TruffleHog, Checkov)")
    available_tools+=("trunk")
else
    missing_tools+=("trunk")
fi

# OSV Scanner
if check_command osv-scanner; then
    tests+=("OSV Scanner|osv-scanner --lockfile package-lock.json|開源漏洞資料庫掃描")
    available_tools+=("osv-scanner")
else
    missing_tools+=("osv-scanner")
fi

# TruffleHog
if check_command trufflehog; then
    tests+=("TruffleHog|trufflehog filesystem . --no-verification|檢測敏感資訊洩漏")
    available_tools+=("trufflehog")
else
    missing_tools+=("trufflehog")
fi

# Checkov
if check_command checkov; then
    tests+=("Checkov|checkov --directory . --framework npm|基礎設施安全檢查")
    available_tools+=("checkov")
else
    missing_tools+=("checkov")
fi

# Snyk (如果可用且未達限制)
if check_command snyk; then
    tests+=("Snyk Security Test|snyk test|Snyk 安全漏洞掃描")
    available_tools+=("snyk")
else
    missing_tools+=("snyk")
fi

# 顯示工具狀態
print_color $GREEN "✅ 可用工具: ${available_tools[*]}"
if [ ${#missing_tools[@]} -gt 0 ]; then
    print_color $YELLOW "⚠️  缺少工具: ${missing_tools[*]}"
    print_color $CYAN "💡 提示: 執行 './scripts/security-test.sh --install' 安裝缺少的工具"
fi

# 執行測試
passed_tests=0
total_tests=${#tests[@]}

print_color $BLUE ""
print_color $BLUE "🚀 開始執行 $total_tests 項安全測試..."

for test in "${tests[@]}"; do
    IFS='|' read -r test_name command description <<< "$test"
    
    if run_security_test "$test_name" "$command" "$description"; then
        results+=("✅ $test_name: 通過")
        ((passed_tests++))
    else
        results+=("❌ $test_name: 失敗")
    fi
    
    echo "" # 空行分隔
done

# 生成報告
generate_report "${results[@]}"

# 總結
print_color $BLUE ""
print_color $BLUE "📊 測試完成摘要"
print_color $BLUE "================="
print_color $CYAN "總測試數: $total_tests"
print_color $GREEN "通過測試: $passed_tests"
print_color $RED "失敗測試: $((total_tests - passed_tests))"

if [ $passed_tests -eq $total_tests ]; then
    print_color $GREEN ""
    print_color $GREEN "🎉 所有安全測試通過！"
    exit 0
else
    print_color $YELLOW ""
    print_color $YELLOW "⚠️  發現安全問題，請檢查報告"
    exit 1
fi
