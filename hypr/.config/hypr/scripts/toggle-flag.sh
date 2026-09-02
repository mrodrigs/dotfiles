#!/bin/bash
# Toggle a permanent Hyprland flag by copying its definition into a state dir
# that hyprland.conf sources entirely (see hyprland.conf).
# Usage: toggle-flag.sh [--enabled-notification <text>] [--disabled-notification <text>] <flag-name>

ENABLED_NOTIFICATION=""
DISABLED_NOTIFICATION=""

while [[ $# -gt 1 ]]; do
  case $1 in
    --enabled-notification) ENABLED_NOTIFICATION="$2"; shift 2 ;;
    --disabled-notification) DISABLED_NOTIFICATION="$2"; shift 2 ;;
    *) break ;;
  esac
done

FLAG_NAME="$1"
FLAG="$HOME/.local/state/hypr/toggles/$FLAG_NAME.conf"
FLAG_SOURCE="$HOME/.config/hypr/toggles/$FLAG_NAME.conf"

if [[ -f $FLAG ]]; then
  rm "$FLAG"
  [[ -n $DISABLED_NOTIFICATION ]] && notify-send -u low "$DISABLED_NOTIFICATION"
elif [[ -f $FLAG_SOURCE ]]; then
  mkdir -p "$(dirname "$FLAG")"
  cp "$FLAG_SOURCE" "$FLAG"
  [[ -n $ENABLED_NOTIFICATION ]] && notify-send -u low "$ENABLED_NOTIFICATION"
else
  echo "Flag not found: $FLAG_NAME"
  exit 1
fi

hyprctl reload
