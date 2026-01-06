#!/bin/bash

##############################################
# 服务器代码重新部署脚本
# 作用：重新 clone 代码并恢复配置
##############################################

set -e  # 遇到错误立即退出

# 配置变量（请根据实际情况修改）
PROJECT_DIR="/www/wwwroot/my--project20251202"
GITHUB_REPO="https://github.com/hulower/my--project20251202.git"
BACKUP_DIR="/tmp/deploy-backup-$(date +%Y%m%d-%H%M%S)"

echo "=========================================="
echo "🚀 开始重新部署项目"
echo "=========================================="
echo ""

# 1. 检查项目目录是否存在
if [ ! -d "$PROJECT_DIR" ]; then
  echo "❌ 错误：项目目录不存在: $PROJECT_DIR"
  exit 1
fi

# 2. 创建备份目录
echo "📦 创建备份目录: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# 3. 备份 .env 文件
echo "💾 备份 .env 文件..."
if [ -f "$PROJECT_DIR/server/.env" ]; then
  cp "$PROJECT_DIR/server/.env" "$BACKUP_DIR/.env"
  echo "✅ .env 文件已备份"
else
  echo "⚠️  警告：.env 文件不存在，跳过"
fi

# 4. 备份 uploads 目录
echo "💾 备份 uploads 目录..."
if [ -d "$PROJECT_DIR/server/uploads" ]; then
  cp -r "$PROJECT_DIR/server/uploads" "$BACKUP_DIR/"
  echo "✅ uploads 目录已备份"
else
  echo "⚠️  警告：uploads 目录不存在，跳过"
fi

# 5. 停止后端服务
echo "🛑 停止后端服务..."
pm2 stop all || echo "⚠️  PM2 进程已停止或不存在"

# 6. 重命名旧项目（保留备份）
echo "📦 备份旧项目目录..."
mv "$PROJECT_DIR" "${PROJECT_DIR}-backup-$(date +%Y%m%d-%H%M%S)"
echo "✅ 旧项目已备份"

# 7. 重新 clone 代码
echo "📥 克隆最新代码..."
cd /www/wwwroot
git clone "$GITHUB_REPO" my--project20251202
cd "$PROJECT_DIR"
echo "✅ 代码克隆完成"

# 8. 恢复 .env 文件
echo "📂 恢复 .env 文件..."
if [ -f "$BACKUP_DIR/.env" ]; then
  mkdir -p server
  cp "$BACKUP_DIR/.env" server/.env
  echo "✅ .env 文件已恢复"
else
  echo "❌ 错误：备份的 .env 文件不存在！"
  exit 1
fi

# 9. 恢复 uploads 目录
echo "📂 恢复 uploads 目录..."
if [ -d "$BACKUP_DIR/uploads" ]; then
  mkdir -p server/uploads
  cp -r "$BACKUP_DIR/uploads/"* server/uploads/
  echo "✅ uploads 目录已恢复"
fi

# 10. 安装依赖
echo "📦 安装依赖..."
cnpm install || npm install
echo "✅ 依赖安装完成"

# 11. 构建前端
echo "🔨 构建前端（需要 5-10 分钟）..."
npm run build
echo "✅ 前端构建完成"

# 12. 启动后端服务
echo "🚀 启动后端服务..."
pm2 start server/index.js --name blog-backend
pm2 save

# 13. 显示状态
echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "📋 服务状态："
pm2 status
echo ""
echo "📝 最新日志："
pm2 logs --lines 10
echo ""
echo "🌐 访问地址："
echo "  - 前端：http://82.156.185.63"
echo "  - API：http://82.156.185.63/api/posts"
echo ""
echo "📦 备份位置："
echo "  - $BACKUP_DIR"
echo "  - ${PROJECT_DIR}-backup-$(date +%Y%m%d)"
echo ""

