#!/bin/bash
set -e

PORT="${PORT:-3001}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

if [ ! -f ".env" ]; then
    warn ".env 文件不存在，请先创建"
    warn "参考 .env.example 填写 SESSION_SECRET、DATABASE_URL 等必要配置"
    exit 1
fi

log "检查 Node.js..."
node -v | grep -q "v22\|v20\|v18" || warn "建议使用 Node.js 18+"

log "启用 pnpm..."
corepack enable 2>/dev/null || npm install -g pnpm@10

log "安装依赖..."
pnpm install --frozen-lockfile

log "生成 Prisma Client..."
npx prisma generate

log "构建项目..."
NODE_ENV=production pnpm run build

log "初始化数据库..."
pnpm run setup:prod

log "启动服务 (端口: $PORT)..."
cd .next/standalone && PORT="$PORT" node server.js
