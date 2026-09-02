#!/bin/bash
# Toggle single-window square aspect ratio.

"$(dirname "$0")/toggle-flag.sh" \
  --enabled-notification "      Enable single-window square aspect ratio" \
  --disabled-notification "      Disable single-window square aspect ratio" \
  single-window-aspect-ratio
