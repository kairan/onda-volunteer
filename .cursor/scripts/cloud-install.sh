#!/usr/bin/env bash
set -euo pipefail

pnpm install

if [ -n "${GH_TOKEN:-}" ]; then
  echo "$GH_TOKEN" | gh auth login --with-token
  gh auth status
  export GITHUB_TOKEN="$GH_TOKEN"
fi
