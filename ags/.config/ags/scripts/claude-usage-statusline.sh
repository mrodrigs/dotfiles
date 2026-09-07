#!/usr/bin/env bash
input=$(cat)

CACHE_DIR="$HOME/.cache/ags"
CACHE_FILE="$CACHE_DIR/claude-usage.json"
mkdir -p "$CACHE_DIR"

EXISTING="{}"
if [ -f "$CACHE_FILE" ] && jq -e . "$CACHE_FILE" >/dev/null 2>&1; then
  EXISTING=$(cat "$CACHE_FILE")
fi

# Multiple concurrent `claude` sessions share this cache via the same global
# statusLine setting. A session with no rate_limits yet (e.g. before its first
# API response) must not clobber a good value another session already wrote,
# so each window only updates when the incoming payload actually has it.
echo "$input" | jq \
  --argjson existing "$EXISTING" \
  --arg now "$(date +%s)" \
  '
  ($existing.five_hour // null) as $prev_5h |
  ($existing.seven_day // null) as $prev_7d |
  (if .rate_limits.five_hour then (.rate_limits.five_hour + {updated_at: ($now | tonumber)}) else $prev_5h end) as $five_hour |
  (if .rate_limits.seven_day then (.rate_limits.seven_day + {updated_at: ($now | tonumber)}) else $prev_7d end) as $seven_day |
  { five_hour: $five_hour, seven_day: $seven_day }
  ' > "$CACHE_FILE.tmp" && mv "$CACHE_FILE.tmp" "$CACHE_FILE"

# Intentionally no stdout output — this script only exists to feed the AGS
# topbar widget's cache, not to display a status line in the terminal.
