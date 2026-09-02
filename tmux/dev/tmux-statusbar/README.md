# tmux-statusbar

A minimal, **transparent** tmux status bar — centered window list with a
session "pill" that lights up while the prefix is held.

It started as a fork of [tmux-dotbar](https://github.com/vaaleyard/tmux-dotbar),
with two changes:

1. The bar background is transparent (`default`) so it blends into the
   terminal / Neovim background instead of painting its own strip.
2. Colors are Oxocarbon (`t_bg`/`t_fg`/`t_dim`/`t_accent`/`t_accent2` near the
   top of `statusbar.tmux`) — edit those directly, or override per-option with
   `@statusbar-*` below.

Mapping:

| Bar element | Color |
| --- | --- |
| Active window text | `t_fg` (foreground) |
| Inactive window / session text | `t_dim` |
| Prefix pill background | `t_accent` |
| Prefix pill text | `t_bg` (background) |
| Zoom icon | `t_accent2` |

The bar background is **always** transparent — `t_bg` is only borrowed for the
pill text so it stays readable.

## Preview

```
 main          • nvim •  server  • logs
       ^session pill   ^current window (brighter)
```

- Centered window list, separated by `•`
- Session name on the left; turns mint (`#95E6CB`) while the prefix is held
- Current window in a brighter fg, with a `󰊓` icon when the pane is zoomed
- Transparent background everywhere except the prefix pill

## Install

Source it from your `~/.config/tmux/tmux.conf`:

```tmux
run-shell ~/dev/tmux-statusbar/statusbar.tmux
```

Then reload tmux (`tmux source ~/.config/tmux/tmux.conf`).

> For a transparent bar you also need a transparent/blurred terminal. If your
> terminal background is opaque, the bar will simply match that solid color.

## Configuration

Set any of these **before** the `run-shell` line:

| Option | Default | Purpose |
| --- | --- | --- |
| `@statusbar-bg` | `default` | Bar background (keep `default` for transparency) |
| `@statusbar-bg-contrast` | `t_bg` | Text color used on bright accent pills |
| `@statusbar-fg` | `t_dim` | Inactive window text |
| `@statusbar-fg-current` | `t_fg` | Active window text |
| `@statusbar-fg-session` | `t_dim` | Session text |
| `@statusbar-accent` | `t_accent` | Prefix highlight |
| `@statusbar-accent-alt` | `t_accent2` | Zoom icon |
| `@statusbar-position` | `top` | `top` or `bottom` |
| `@statusbar-justify` | `absolute-centre` | Window list alignment |
| `@statusbar-separator` | ` • ` | Between windows |
| `@statusbar-session-text` | ` #S ` | Session label format |
| `@statusbar-window-text` | ` #I>#W ` | Window label format (`#I` = index, `#W` = name) |
| `@statusbar-zoom-icon` | `󰊓` | Shown when a pane is zoomed |

Example:

```tmux
set -g @statusbar-accent "#7aa2f7"
set -g @statusbar-position "bottom"
run-shell ~/dev/tmux-statusbar/statusbar.tmux
```

## Extending it

The bottom of `statusbar.tmux` has an `extensions` section. Drop standalone
feature scripts in `scripts/` and source them, or add `set-option` calls
directly. Ideas to start with:

- **Clock on the right:**
  ```tmux
  tmux set-option -g status-right "#[bg=${bg},fg=${fg_session}] %H:%M "
  ```
- **SSH host indicator** (port from tmux-dotbar): swap the window format to
  show the remote host when `pane_current_command` is `ssh`.
- **Git branch** of the current pane's directory on the right.

## Credits

Color scheme and original layout from
[tmux-dotbar](https://github.com/vaaleyard/tmux-dotbar) by vaaleyard (MIT).
