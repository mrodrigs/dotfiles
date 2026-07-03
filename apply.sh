#!/bin/bash
# Deploy configs from this repo onto $HOME (run on a new/other machine).
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$REPO/paths.sh"

for p in "${PATHS[@]}"; do
  src="$REPO/$p" dst="$HOME/$p"
  [ -e "$src" ] || { echo "skip (missing): $p"; continue; }
  mkdir -p "$(dirname "$dst")"
  if [ -d "$src" ]; then
    rsync -a "${EXCLUDES[@]}" "${APPLY_EXCLUDES[@]}" "$src/" "$dst/"   # overlay, no --delete: keep machine-local files
  else
    rsync -a "$src" "$dst"
  fi
  echo "applied: $p"
done

cat <<'EOF'

Post-apply (once, on a fresh machine):
  git clone <theme-repo> ~/.config/omarchy/themes/take-easy
  git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm   # then prefix+I
  omarchy theme set "Take Easy"
  hyprctl reload && omarchy restart waybar
  # nvim plugins auto-install from lazy-lock.json on first launch
EOF
