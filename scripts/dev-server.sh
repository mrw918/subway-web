#!/usr/bin/env bash
# 本地静态预览（Readme 要求 HTTP，勿 file:// 打开 index.html）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-8080}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "未找到 python3，请安装 Python 3 后重试。" >&2
  exit 1
fi

cd "$ROOT"

if lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "已在端口 ${PORT} 运行 HTTP 服务"
  echo "预览: http://localhost:${PORT}/index.html"
  exit 0
fi

echo "Serving HTTP on http://localhost:${PORT}/index.html"
exec python3 -m http.server "$PORT"
