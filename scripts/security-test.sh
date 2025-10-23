#!/bin/bash
# AI Feedback SDK - 完整安全測試腳本 (Bash)
# 整合所有可用的安全測試工具

set -e

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
OUTPUT_DIR="security-reports"

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
            shift
            ;;
        --output-dir)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        *)
            echo "未知參數: $1"
            exit 1
            ;;
    esac
done

# 工具函數
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

check_command() {
    command -v "$1" >/dev/null 2>&1
}

install_security_tools() {
    print_color $BLUE "🔧 安裝安全測試工具..."
    
    # 檢查並安裝 Node.js 工具
    if check_command npm; then
        print_color $CYAN "📦 安裝 npm 安全工具..."
        npm install -g osv-scanner trufflehog checkov 2>/dev/null || true
    fi
    
    # 檢查並安裝 Trunk
    if ! check_command trunk; then
        print_color $CYAN "📥 安裝 Trunk CLI..."
        # Linux/macOS 安裝指令
        curl -fsSL https://get.trunk.io | bash
    fi
    
    # 檢查並安裝 Snyk
    if ! check_command snyk; then
        print_color $CYAN "📥 安裝 Snyk CLI..."
        npm install -g snyk 2>/dev/null || true
    fi
    
    print_color $GREEN "✅ 工具安裝完成"
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

# 基本 npm 安全測試
tests+=("NPM Audit|npm audit|檢查 npm 依賴套件安全漏洞")

# Trunk 安全檢查
if check_command trunk; then
    trunk_cmd="trunk check --all"
    if [ "$FIX" = true ]; then
        trunk_cmd="trunk check --all --fix"
    fi
    tests+=("Trunk Security Check|$trunk_cmd|Trunk 整合安全檢查 (ESLint, OSV, TruffleHog, Checkov)")
fi

# OSV Scanner
if check_command osv-scanner; then
    tests+=("OSV Scanner|osv-scanner --lockfile package-lock.json|開源漏洞資料庫掃描")
fi

# TruffleHog
if check_command trufflehog; then
    tests+=("TruffleHog|trufflehog filesystem . --no-verification|檢測敏感資訊洩漏")
fi

# Checkov
if check_command checkov; then
    tests+=("Checkov|checkov --directory . --framework npm|基礎設施安全檢查")
fi

# Snyk (如果可用且未達限制)
if check_command snyk; then
    tests+=("Snyk Security Test|snyk test|Snyk 安全漏洞掃描")
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
