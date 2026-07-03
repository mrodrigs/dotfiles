#!/bin/bash

# Outputs the current city temperature for waybar (JSON).
# Caches the result to avoid hammering wttr.in on every interval.

cache="${XDG_CACHE_HOME:-$HOME/.cache}/waybar-weather-temp"
max_age=600 # seconds

if [[ -f $cache ]] && (( $(date +%s) - $(stat -c %Y "$cache") < max_age )); then
  cat "$cache"
  exit 0
fi

location="Queiroz,Sao+Paulo,Brazil"
temp=$(curl -fsS --max-time 4 "https://wttr.in/${location}?format=%t" 2>/dev/null | tr -d '\n' | tr -d '+')

if [[ -n $temp ]]; then
  printf '{"text":"%s"}\n' "$temp" | tee "$cache"
else
  # Fall back to last good value if we have one, otherwise mark unavailable
  if [[ -f $cache ]]; then
    cat "$cache"
  else
    printf '{"text":"","class":"unavailable"}\n'
  fi
fi
