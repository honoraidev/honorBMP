#!/bin/sh
# 自動部署腳本：git pull -> 有新版本才重新建置
# 用 DSM 工作排程器排程執行，或手動跑：sudo sh auto-deploy.sh
set -e

PROJECT_DIR="/volume1/docker/chengshi-appraisal"
cd "$PROJECT_DIR"

GIT="docker run --rm -v ${PROJECT_DIR}:/data -w /data alpine/git"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] checking for updates..."

BEFORE=$($GIT rev-parse HEAD)
$GIT pull
AFTER=$($GIT rev-parse HEAD)

if [ "$BEFORE" = "$AFTER" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] no changes ($BEFORE)"
  exit 0
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] updated $BEFORE -> $AFTER, rebuilding..."
docker compose up -d --build

# 如果這次更新有動到 ts-serve.json，web 和 ts 都要一起重建
if $GIT diff --name-only "$BEFORE" "$AFTER" | grep -q '^ts-serve\.json$'; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ts-serve.json changed, recreating ts + web..."
  docker compose up -d --force-recreate ts web
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] deploy complete"
