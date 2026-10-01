#!/usr/bin/env bash
# =============================================
# 企业业务门户 - 一键初始化脚本
# 功能：创建数据库 + 启用扩展 + 导入表结构与示例数据
# 用法：
#   ./setup.sh                      # 从 .env 读取 DATABASE_URL
#   ./setup.sh "postgresql://..."   # 直接传入连接串
#   ./setup.sh "postgresql://..." /path/to/init.sql
# =============================================
set -e

# ---------- 参数解析 ----------
if [ -n "$1" ]; then
  DATABASE_URL="$1"
else
  if [ -f ".env" ]; then
    DATABASE_URL=$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d'=' -f2-)
  fi
fi
if [ -z "$DATABASE_URL" ]; then
  echo "[错误] 未提供 DATABASE_URL，请通过参数传入或在 .env 中配置。"
  echo "示例：./setup.sh \"postgresql://postgres:postgres@localhost:5432/portal_app\""
  exit 1
fi

SQL_FILE="${2:-init.sql}"
if [ ! -f "$SQL_FILE" ]; then
  echo "[错误] 找不到 SQL 文件：$SQL_FILE"
  exit 1
fi

# ---------- 解析连接串 ----------
# 格式：postgresql://user:pass@host:port/dbname
URL_NO_PREFIX="${DATABASE_URL#*://}"
CRED_HOST="${URL_NO_PREFIX%%/*}"
DB_NAME="${URL_NO_PREFIX##*/}"
DB_NAME="${DB_NAME%%\?*}"
DB_NAME="${DB_NAME%%\#*}"
USER_PART="${CRED_HOST%%@*}"
HOST_PART="${CRED_HOST##*@}"
PGUSER="${USER_PART%%:*}"
PGPASSWORD="${USER_PART#*:}"
if [ "$PGPASSWORD" = "$USER_PART" ]; then PGPASSWORD=""; fi
PGHOST="${HOST_PART%%:*}"
PGPORT="${HOST_PART##*:}"
if [ "$PGPORT" = "$HOST_PART" ]; then PGPORT="5432"; fi

export PGPASSWORD

echo "=============================================="
echo " 企业业务门户 - 一键初始化"
echo " 主机: $PGHOST  端口: $PGPORT"
echo " 用户: $PGUSER  数据库: $DB_NAME"
echo "=============================================="

# ---------- 1. 创建数据库（如不存在） ----------
echo "[1/3] 检查并创建数据库 '$DB_NAME' ..."
EXISTS=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -tAc \
  "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
if [ "$EXISTS" = "1" ]; then
  echo "     数据库已存在，跳过创建。"
else
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres \
    -c "CREATE DATABASE \"$DB_NAME\";"
  echo "     数据库创建成功。"
fi

# ---------- 2. 启用扩展 ----------
echo "[2/3] 启用 uuid-ossp 扩展 ..."
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$DB_NAME" \
  -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'

# ---------- 3. 导入表结构与示例数据 ----------
echo "[3/3] 导入 $SQL_FILE ..."
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$DB_NAME" -f "$SQL_FILE"

echo "=============================================="
echo " 初始化完成！数据库 '$DB_NAME' 已就绪。"
echo " 启动服务：npm run dev"
echo " 前端：http://localhost:5173（Vite 默认端口，以实际输出为准）"
echo " 后端 API：以 .env 中 SERVER_PORT 为准（默认 3000）"
echo "=============================================="
#（注：内容由AI生成）
