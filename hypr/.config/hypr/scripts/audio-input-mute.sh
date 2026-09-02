#!/bin/bash
# Toggle microphone mute. Drives the hardware mic-mute LED on laptops that expose one.

dir="$(dirname "$0")"

wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle >/dev/null

if pactl get-source-mute @DEFAULT_SOURCE@ | grep -q 'yes'; then
  led=on
  osd_message='Microphone muted'
  osd_icon='microphone-sensitivity-muted-symbolic'
else
  led=off
  osd_message='Microphone on'
  osd_icon='audio-input-microphone-symbolic'
fi

"$dir/mic-mute-led.sh" "$led"

"$dir/swayosd-client.sh" \
  --custom-message "$osd_message" \
  --custom-icon "$osd_icon"
