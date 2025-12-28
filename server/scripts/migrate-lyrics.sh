#!/bin/bash
# server/scripts/migrate-lyrics.sh
# 为 music 表添加 lyrics 字段

echo "🚀 开始执行数据库迁移：添加 lyrics 字段到 music 表..."

# 从 .env 文件加载数据库配置
if [ -f "./server/.env" ]; then
  export $(grep -v '^#' ./server/.env | xargs)
else
  echo "❌ 错误：未找到 server/.env 文件。"
  exit 1
fi

DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-}
DB_NAME=${DB_NAME:-my_node_app}
DB_HOST=${DB_HOST:-localhost}

# 检查 DB_PASSWORD 是否为空
if [ -z "$DB_PASSWORD" ]; then
  MYSQL_AUTH_CMD="mysql -h $DB_HOST -u $DB_USER $DB_NAME"
else
  MYSQL_AUTH_CMD="mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME"
fi

# 执行 SQL 迁移脚本
$MYSQL_AUTH_CMD < ./server/scripts/add-lyrics-to-music.sql

if [ $? -eq 0 ]; then
  echo "✅ 数据库迁移成功：music 表已添加 lyrics 字段。"
  echo "📝 现在你可以为音乐添加歌词了！"
  echo "🔄 请重启后端服务以应用更改。"
else
  echo "❌ 数据库迁移失败。请检查错误信息。"
fi

