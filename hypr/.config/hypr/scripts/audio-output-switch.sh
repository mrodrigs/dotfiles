#!/bin/bash
# Switch between audio outputs while preserving the mute status.

sinks=$(pactl -f json list sinks | jq '[.[] | select((.ports | length == 0) or ([.ports[]? | .availability != "not available"] | any))]')
sinks_count=$(echo "$sinks" | jq '. | length')

if (( sinks_count == 0 )); then
  exit 1
fi

current_sink_name=$(pactl get-default-sink)
current_sink_index=$(echo "$sinks" | jq -r --arg name "$current_sink_name" 'map(.name) | index($name)')

if [[ $current_sink_index != "null" ]]; then
  next_sink_index=$(((current_sink_index + 1) % sinks_count))
else
  next_sink_index=0
fi

next_sink=$(echo "$sinks" | jq -r ".[$next_sink_index]")
next_sink_name=$(echo "$next_sink" | jq -r '.name')

if [[ $next_sink_name != $current_sink_name ]]; then
  next_sink_wpid=$(echo "$next_sink" | jq -r '.properties."object.id"')
  wpctl set-default "$next_sink_wpid"
fi
