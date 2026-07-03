# dotfiles

Omarchy config, synced across machines with two rsync scripts — no symlinks, no stow.
`save.sh` copies live configs **into** the repo; `apply.sh` copies them **out** onto a machine.

## What's tracked

| Path | What |
|------|------|
| `.config/hypr` | Hyprland (bindings, monitors, looknfeel, lock, idle…) |
| `.config/nvim` | LazyVim config + `lazy-lock.json` (plugin version pins) |
| `.config/tmux/tmux.conf` | tmux config |
| `.config/walker` | launcher |
| `.config/waybar` | bar config + style |
| `.config/omarchy/{hooks,backgrounds,branding}` | omarchy customizations |

Not tracked (reinstalled instead): themes → `themes-reinstall.sh`; tmux/nvim plugins → reinstall from lock files.
The tracked list lives in `paths.sh` — edit there, both scripts read it.

## Save (on the machine you're configuring from)

```bash
bash ~/dotfiles/save.sh          # harvest live ~/.config into the repo
git -C ~/dotfiles add -A && git -C ~/dotfiles commit -m update && git -C ~/dotfiles push
```

## Apply (on a new/other machine)

```bash
git clone <repo-url> ~/dotfiles
bash ~/dotfiles/apply.sh                 # deploy configs (skips monitors.conf)
bash ~/dotfiles/apply.sh --with-monitors # ...or include monitors.conf too

bash ~/dotfiles/themes-reinstall.sh      # re-download installed themes
git clone git@github.com:mrodrigs/take-easy-omarchy.git ~/.config/omarchy/themes/take-easy
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm   # then: tmux, prefix + I
omarchy theme set "Take Easy"
hyprctl reload && omarchy restart waybar
# nvim plugins auto-install from lazy-lock.json on first launch
```

## Notes

- `save.sh` mirrors with `--delete` (repo stays clean). `apply.sh` overlays without `--delete` (won't wipe machine-local files).
- `monitors.conf` is saved to the repo but skipped on apply by default, since displays differ per PC. Use `--with-monitors` to force it.
- `apply.sh` overwrites configs in place — `git` is your undo.
