#!/bin/bash
# Toggle microphone mute. Drives the hardware mic-mute LED on laptops that expose one.

dir="$(dirname "$0")"

wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle >/dev/null

if pactl get-source-mute @DEFAULT_SOURCE@ | grep -q 'yes'; then
  led=on
else
  led=off
fi

"$dir/mic-mute-led.sh" "$led"
