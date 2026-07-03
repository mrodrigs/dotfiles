#!/usr/bin/env bash
#
# tmux-statusbar — a minimal, transparent status bar that follows the
# current Omarchy theme.
#
# Derived from tmux-dotbar (MIT, vaaleyard). The bar background is kept
# transparent so it blends into the terminal / Neovim background; the rest of
# the colors are pulled live from the active Omarchy theme, so the bar
# re-themes itself whenever you run `omarchy theme set ...`.
#
# Usage (in ~/.config/tmux/tmux.conf):
#   run-shell ~/dev/tmux-statusbar/statusbar.tmux
#
# Every color/option is overridable with `set -g @statusbar-* ...` BEFORE the
# run-shell line; an explicit override always wins over the theme color.

# --- helpers ----------------------------------------------------------------

# Directory of this script, so we can reach ./scripts regardless of cwd.
CURRENT_DIR="$(cd "$(dirname "$0")" && pwd)"

get() {
  # get <@option> <default>
  local value
  value=$(tmux show-options -gqv "$1")
  [ -n "$value" ] && echo "$value" || echo "$2"
}

# --- omarchy theme colors ---------------------------------------------------
# Resolve each color from the current Omarchy theme. Source priority:
#   1. colors.toml   (all stock themes + most custom ones; named + base16 keys)
#   2. alacritty.toml (fallback for custom themes without colors.toml)
#   3. built-in Ayu defaults (if neither file/key is found)
# This is per-color, so a missing key only falls through for that one color.

theme_dir="$HOME/.config/omarchy/current/theme"
ctoml="$theme_dir/colors.toml"
alac="$theme_dir/alacritty.toml"

# pick <file> <key-regex> [<nth-match>] -> first #RRGGBB on a matching,
# non-comment line (comments and section headers are ignored).
pick() {
  local f="$1" key="$2" n="${3:-1}"
  [ -f "$f" ] || return 1
  grep -vE '^[[:space:]]*#' "$f" 2>/dev/null \
    | grep -iE "^[[:space:]]*$key[[:space:]]*=" \
    | grep -oiE '#[0-9A-Fa-f]{6}' | sed -n "${n}p"
}

# resolve <default> <colors.toml-key> <alacritty-key> [<alacritty-nth>]
resolve() {
  local out
  out=$(pick "$ctoml" "$2");          [ -n "$out" ] && { echo "$out"; return; }
  out=$(pick "$alac" "$3" "${4:-1}"); [ -n "$out" ] && { echo "$out"; return; }
  echo "$1"
}

t_bg=$(resolve      "#0B0E14" "background" "background")     # theme background
t_fg=$(resolve      "#BFBDB6" "foreground" "foreground")     # theme foreground
t_dim=$(resolve     "#475266" "color8"     "black" 2)        # dim / bright-black
t_accent=$(resolve  "#95E6CB" "color4"     "blue")           # primary accent
t_accent2=$(resolve "#39BAE6" "color6"     "cyan")           # secondary accent

# --- palette ----------------------------------------------------------------
# `bg` stays `default` (transparent) regardless of theme so the bar inherits
# the terminal/nvim background. `bg_contrast` is the theme background, used
# ONLY for text sitting on top of the bright accent pill so it stays readable.

bg=$(get          "@statusbar-bg"          "default")     # transparent
bg_contrast=$(get "@statusbar-bg-contrast" "$t_bg")       # text on accents

fg=$(get          "@statusbar-fg"          "$t_dim")      # inactive windows
fg_current=$(get  "@statusbar-fg-current"  "$t_fg")       # active window
fg_session=$(get  "@statusbar-fg-session"  "$t_dim")      # session text
accent=$(get      "@statusbar-accent"      "$t_accent")   # bell highlight
accent_prefix=$(get "@statusbar-accent-prefix" "#ee5396") # session pill bg while prefix (leader) held
accent_alt=$(get  "@statusbar-accent-alt"  "$t_accent2") # zoom icon

# --- options ----------------------------------------------------------------

position=$(get  "@statusbar-position"   "top")
justify=$(get   "@statusbar-justify"    "absolute-centre")
separator=$(get "@statusbar-separator"  " • ")
zoom_icon=$(get "@statusbar-zoom-icon"  "󰊓")

session_text=$(get "@statusbar-session-text" " #S ")

# Window text. The middle "#I…#W" separator is produced by window-process.sh,
# which inspects what is running in the window's pane: " ❯ " normally
# (renders "1 ❯ name"), or " ❯ claude: " when a recognized program is running
# (renders "1 ❯ claude: name"). Extend the matcher table in that script to
# label other programs.
proc_script="$CURRENT_DIR/scripts/window-process.sh"
window_text=$(get  "@statusbar-window-text"  " #I#(${proc_script} #{pane_pid})#W ")

# --- components -------------------------------------------------------------
# Session "pill": shows just the session name normally, and lights up with
# the accent color while the prefix key is held (client_prefix).

session_left=$(get "@statusbar-session-left"  " ")  # rounded edge glyph
session_right=$(get "@statusbar-session-right" "")

# Inner text loses its surrounding padding when the pill is drawn, so the
# rounded edges replace the padding and the width stays stable.
inner="$session_text"
[ "${#session_text}" -gt 2 ] && inner="${session_text:1:${#session_text}-2}"

# NOTE: commas separate the branches of a #{?...} conditional, so the style
# specs inside it must use comma-free, single-attribute blocks (#[bg=..]#[fg=..])
# instead of #[bg=..,fg=..] — otherwise tmux splits the style at the comma.
session_normal="#[bg=${bg}]#[fg=${fg_session}]${session_text}"
session_prefix="#[bg=${bg}]#[fg=${accent_prefix}]${session_left}#[bg=${accent_prefix}]#[fg=${bg_contrast}]#[bold]${inner}#[nobold]#[bg=${bg}]#[fg=${accent_prefix}]${session_right}"
session_component="#{?client_prefix,${session_prefix},${session_normal}}"

# Current window: brighter fg, with a zoom indicator when the pane is maximized.
current_window="#[bg=${bg},fg=${fg_current}]${window_text}#[bg=${bg},fg=${accent_alt}]#{?window_zoomed_flag,${zoom_icon},}"

# --- apply ------------------------------------------------------------------

tmux set-option -g status on
tmux set-option -g status-position "$position"
tmux set-option -g status-justify "$justify"
tmux set-option -g status-style "bg=${bg},fg=${fg}"

tmux set-option -g status-left "$session_component"
tmux set-option -g status-left-length 60
tmux set-option -g status-right ""

tmux set-window-option -g window-status-separator "$separator"
tmux set-window-option -g window-status-style "bg=${bg},fg=${fg}"
tmux set-window-option -g window-status-format "$window_text"
tmux set-window-option -g window-status-current-format "$current_window"
tmux set-window-option -g window-status-bell-style "bg=${accent},fg=${bg_contrast},bold"
tmux set-window-option -g window-status-activity-style "bg=${fg_current},fg=${bg_contrast}"

# --- extensions -------------------------------------------------------------
# Add your own features below (or source files from ./scripts). For example,
# a clock on the right edge:
#
#   tmux set-option -g status-right "#[bg=${bg},fg=${fg_session}] %H:%M "
#   tmux set-option -g status-right-length 40
#
# See README.md for more ideas (SSH host display, git branch, etc.).
