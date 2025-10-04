#!/usr/bin/env bash
set -euo pipefail

msg=${1:-"Atualização rápida"}

git add -A
git commit -m "$msg"
git push

echo "✅ Push concluído: $msg"