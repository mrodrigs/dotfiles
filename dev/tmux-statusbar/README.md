# tmux-statusbar

A minimal, **transparent**, **Omarchy-theme-aware** tmux status bar — centered
window list with a session "pill" that lights up while the prefix is held.

It started as a fork of [tmux-dotbar](https://github.com/vaaleyard/tmux-dotbar),
with two changes:

1. The bar background is transparent (`default`) so it blends into the
   terminal / Neovim background instead of painting its own strip.
2. Its colors are pulled live from the current
   [Omarchy](https://omarchy.org) theme, so it re-themes itself whenever you
   run `omarchy theme set ...` — like a Chromium/Neovim theme follower.

## Theme following

Colors are resolved from the active theme at
`~/.config/omarchy/current/theme`, in priority order:

1. `colors.toml` — present in all stock themes (named keys + a base16 palette)
2. `alacritty.toml` — fallback for custom themes without `colors.toml`
3. Built-in Ayu defaults — if neither file/key is found

Mapping:

| Bar element | Theme color |
| --- | --- |
| Active window text | `foreground` |
| Inactive window / session text | `color8` (dim / bright-black) |
| Prefix pill background | `color4` (accent) |
| Prefix pill text | `background` |
| Zoom icon | `color6` (secondary accent) |

The bar background is **always** transparent — the theme's `background` is only
borrowed for the pill text so it stays readable.

Automatic re-theming is wired through the Omarchy hook
`~/.config/omarchy/hooks/theme-set`, which re-runs `statusbar.tmux` after every
theme change. Any explicit `@statusbar-*` override still wins over the theme.

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

Color defaults below come from the **current Omarchy theme**; the hex values
shown are the built-in fallback used only when no theme color is found.

| Option | Default | Purpose |
| --- | --- | --- |
| `@statusbar-bg` | `default` | Bar background (keep `default` for transparency) |
| `@statusbar-bg-contrast` | theme `background` | Text color used on bright accent pills |
| `@statusbar-fg` | theme `color8` | Inactive window text |
| `@statusbar-fg-current` | theme `foreground` | Active window text |
| `@statusbar-fg-session` | theme `color8` | Session text |
| `@statusbar-accent` | theme `color4` | Prefix highlight |
| `@statusbar-accent-alt` | theme `color6` | Zoom icon |
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
