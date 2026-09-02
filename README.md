# dotfiles

Managed with [GNU Stow](https://www.gnu.org/software/stow/) — one package per directory, each mirroring
`$HOME`. `stow <package>` symlinks its contents into place; `stow -D <package>` removes the symlinks.

## Packages

| Package | Symlinks to | What |
|---|---|---|
| `hypr` | `~/.config/hypr` | Hyprland (bindings, monitors, looknfeel, lock, idle, scripts…) |
| `waybar` | `~/.config/waybar` | Bar config + style + scripts |
| `walker` | `~/.config/walker` | Launcher |
| `mako` | `~/.config/mako` | Notifications |
| `swayosd` | `~/.config/swayosd` | Volume/brightness OSD |
| `nvim` | `~/.config/nvim` | LazyVim config + `lazy-lock.json` (plugin version pins) |
| `tmux` | `~/.config/tmux/tmux.conf`, `~/dev/tmux-statusbar` | tmux config + custom status bar (sourced by `tmux.conf`) |
| `ghostty` | `~/.config/ghostty/config` | Terminal |
| `fish` | `~/.config/fish` | Shell |
| `git` | `~/.config/git/{config,ignore}` | git aliases/config |
| `xcompose` | `~/.XCompose` | Compose key sequences |

## Install (new machine)

```bash
git clone git@github.com:mrodrigs/dotfiles.git ~/dotfiles
cd ~/dotfiles
stow hypr waybar walker mako swayosd nvim tmux ghostty fish git xcompose
```

If a target file already exists (e.g. a fresh install's default `~/.config/fish`), either remove it first or
adopt it into the repo (careful: this overwrites the repo copy with whatever's live):

```bash
stow --adopt <package>   # then `git diff` to check nothing unwanted got pulled in
```

## Reinstall separately (not versioned here)

These are regenerated/reinstalled rather than tracked, since they're plugin checkouts or third-party
downloads, not your own config:

```bash
# tmux plugin manager + plugins
git clone https://github.com/tmux-plugins/tpm ~/.config/tmux/plugins/tpm
tmux new -d && tmux send-keys -t 0 'prefix + I'   # or just open tmux and hit prefix+I

# ghostty custom cursor shaders
git clone https://github.com/sahaj-b/ghostty-cursor-shaders ~/.config/ghostty/shaders

# nvim plugins auto-install from lazy-lock.json on first launch
```

`monitors.conf` (inside the `hypr` package) is machine-specific — check it before stowing on a new box, or
just edit it locally after; it's a real file like any other, git tracks your edits.


## Add a new package

```bash
mkdir -p newpkg/.config/newapp
mv ~/.config/newapp/* newpkg/.config/newapp/
stow newpkg
```
