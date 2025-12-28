#!/bin/bash
# server/scripts/migrate-slug.sh
# 为 posts 表添加 slug 字段的数据库迁移脚本

echo "🚀 开始执行数据库迁移：添加 slug 字段到 posts 表..."

# 从 .env 文件加载数据库配置
if [ -f "./server/.env" ]; then
  export $(grep -v '^#' ./server/.env | xargs)
else
  echo "❌ 错误：未找到 server/.env 文件。请确保文件存在并包含数据库配置。"
  exit 1
fi

DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-}
DB_NAME=${DB_NAME:-my_node_app}
DB_HOST=${DB_HOST:-localhost}

# 检查 DB_PASSWORD 是否为空，如果为空则不使用 -p 参数
if [ -z "$DB_PASSWORD" ]; then
  MYSQL_AUTH_CMD="mysql -h $DB_HOST -u $DB_USER $DB_NAME"
else
  MYSQL_AUTH_CMD="mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME"
fi

# 执行 SQL 迁移脚本
$MYSQL_AUTH_CMD < ./server/scripts/add-slug-to-posts.sql

if [ $? -eq 0 ]; then
  echo "✅ 数据库迁移成功：posts 表已添加 slug 字段。"
  echo ""
  echo "📝 现有文章已使用临时 slug（格式：post-{id}）。"
  echo "   在后续编辑文章时，系统会自动根据标题生成友好的 slug。"
  echo ""
  echo "🔄 请重启后端服务以应用更改。"
else
  echo "❌ 数据库迁移失败。请检查错误信息。"
fi

