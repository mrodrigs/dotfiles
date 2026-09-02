#!/bin/bash
# Wrapper for swayosd-client that targets the currently focused monitor.

dir="$(dirname "$0")"
exec swayosd-client --monitor "$("$dir/monitor-focused.sh")" "$@"
