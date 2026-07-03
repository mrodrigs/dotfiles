#!/bin/bash
# Reinstall installed Omarchy themes on a fresh machine.
# take-easy (your own theme) is cloned separately; not listed here.
set -u
themes=(
  https://github.com/JJDizz1L/aetheria.git
  https://github.com/j4v3l/omarchy-anonymous-theme
  https://github.com/atif-1402/omarchy-apocalypse-theme.git
  https://github.com/davidguttman/archwave
  https://github.com/bjarneo/omarchy-ash-theme
  https://github.com/twodogsdave/omarchy-bliss-theme.git
  https://github.com/Luquatic/omarchy-catppuccin-glass
  https://github.com/SeanAnd/omarchy-cyberpunk-theme.git
  https://github.com/jbnunn/omarchy-delorean-theme.git
  https://github.com/JustArmaan/omarchy-gotham-city-theme.git
  https://github.com/OldJobobo/omarchy-hex-theme
  https://github.com/YutaKoyanagi10/omarchy-koyanagi-theme.git
  https://github.com/atif-1402/omarchy-latchdark-theme.git
  https://github.com/atif-1402/omarchy-manga-theme.git
  https://github.com/bjarneo/omarchy-nes-theme
  https://github.com/HANCORE-linux/omarchy-oxocarbon-theme.git
  https://github.com/ankur311sudo/snow_black
  https://github.com/abhijeet-swami/omarchy-spectra-theme
  https://github.com/stannorbvb-cmd/synthetica.git
)
for u in "${themes[@]}"; do echo ">> $u"; omarchy theme install "$u" || echo "  FAILED: $u"; done
