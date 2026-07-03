# Single source of truth for both save.sh and apply.sh.
# Paths are relative to $HOME. Dirs are mirrored; single files are copied.

PATHS=(
  .config/hypr
  .config/nvim
  .config/tmux/tmux.conf
  .config/walker
  .config/waybar
  .config/omarchy/hooks
  .config/omarchy/backgrounds
  .config/omarchy/branding
)

# rsync excludes: plugin checkouts, backups, regenerated state, the theme symlink.
EXCLUDES=(
  --exclude='plugins/'
  --exclude='*.bak.*'
  --exclude='take-easy'        # theme lives in its own git repo
  --exclude='.git/'
)
