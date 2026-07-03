#!/bin/bash
# Harvest live configs from $HOME into this repo, then `git commit`.
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$REPO/paths.sh"

for p in "${PATHS[@]}"; do
  src="$HOME/$p" dst="$REPO/$p"
  [ -e "$src" ] || { echo "skip (missing): $p"; continue; }
  mkdir -p "$(dirname "$dst")"
  if [ -d "$src" ]; then
    rsync -a --delete "${EXCLUDES[@]}" "$src/" "$dst/"   # repo mirrors home exactly
  else
    rsync -a "$src" "$dst"
  fi
  echo "saved: $p"
done
echo; echo "Now: cd $REPO && git add -A && git commit -m 'update' && git push"
