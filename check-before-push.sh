#!/bin/bash

echo "========================================"
echo "🔍 推送前安全检查"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数
PASS=0
FAIL=0

# 检查 1: .env 是否在 .gitignore 中
echo "检查 1: .env 是否在 .gitignore 中..."
if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✅ PASS${NC}: .env 已在 .gitignore 中"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: .env 不在 .gitignore 中"
    ((FAIL++))
fi
echo ""

# 检查 2: .env 是否被 git 追踪
echo "检查 2: .env 是否被 git 追踪..."
if git ls-files | grep -q "^\.env$"; then
    echo -e "${RED}❌ FAIL${NC}: .env 文件被 git 追踪，需要移除"
    echo "   运行: git rm --cached .env"
    ((FAIL++))
else
    echo -e "${GREEN}✅ PASS${NC}: .env 未被 git 追踪"
    ((PASS++))
fi
echo ""

# 检查 3: 代码中是否有硬编码密码（排除文档）
echo "检查 3: 代码中是否有硬编码密码..."
FOUND=$(grep -r "13698810685qwe" \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude=".env" \
    --exclude="*.md" \
    --exclude="check-before-push.sh" \
    . 2>/dev/null)

if [ -n "$FOUND" ]; then
    echo -e "${RED}❌ FAIL${NC}: 发现硬编码密码"
    echo "$FOUND"
    ((FAIL++))
else
    echo -e "${GREEN}✅ PASS${NC}: 未发现硬编码密码"
    ((PASS++))
fi
echo ""

# 检查 4: .env.example 是否存在
echo "检查 4: .env.example 是否存在..."
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ PASS${NC}: .env.example 文件存在"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  WARN${NC}: .env.example 文件不存在（建议创建）"
fi
echo ""

# 检查 5: 数据库配置是否使用环境变量
echo "检查 5: 数据库配置是否使用环境变量..."
if grep -q "process.env.DB_PASSWORD" server/src/config/db.js; then
    echo -e "${GREEN}✅ PASS${NC}: 数据库配置使用环境变量"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: 数据库配置未使用环境变量"
    ((FAIL++))
fi
echo ""

# 总结
echo "========================================"
echo "📊 检查结果"
echo "========================================"
echo -e "通过: ${GREEN}${PASS}${NC}"
echo -e "失败: ${RED}${FAIL}${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 所有检查通过！可以安全推送到 GitHub${NC}"
    echo ""
    echo "推送命令："
    echo "  git add ."
    echo "  git commit -m '🔒 安全修复：使用环境变量管理敏感信息'"
    echo "  git push"
    exit 0
else
    echo -e "${RED}⚠️  发现 ${FAIL} 个问题，请修复后再推送${NC}"
    exit 1
fi
