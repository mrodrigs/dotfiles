# dotfiles

Personal config for Hyprland, waybar, walker, mako, swayosd, nvim, tmux, ghostty, fish, git, and XCompose.
Deployed one of two ways depending on the machine — same files, two mechanisms:

- **Arch / any other Linux** — [GNU Stow](https://www.gnu.org/software/stow/) symlinks each package into `$HOME`.
- **NixOS** — `flake.nix` + `home.nix` (Home Manager) symlink the same directories in declaratively.

## Layout

Every top-level directory except `nixos/` is a package: it mirrors `$HOME`, so e.g. `hypr/.config/hypr/*`
lands at `~/.config/hypr/*` regardless of which mechanism deploys it.

| Package | Lands at | What |
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

`nixos/` is NixOS-only: `nixos/hosts/<host>/{configuration.nix,hardware-configuration.nix}`, one folder per
machine. `flake.nix` and `home.nix` sit at the repo root since they're shared across every host (see the
NixOS section below for why).

`monitors.conf` (inside `hypr`) and `hardware-configuration.nix` (inside `nixos/hosts/<host>`) are the two
genuinely machine-specific files in this repo — expect to check/edit them on every new box.

## Not tracked here (reinstall separately)

Plugin checkouts and third-party downloads, not your own config — regenerated instead of versioned, on
either platform:

```bash
# tmux plugin manager + plugins (tmux.conf's `run` line expects ~/.tmux, not ~/.config/tmux)
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
# then open tmux and hit prefix+I

# ghostty custom cursor shaders
git clone https://github.com/sahaj-b/ghostty-cursor-shaders ~/.config/ghostty/shaders

# nvim plugins auto-install from lazy-lock.json on first launch
```

---

## Arch / other Linux — GNU Stow

### Install (new machine)

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

Check `hypr/.config/hypr/monitors.conf` once stowed — it's this machine's display layout, not a template.

### Update

Every live config file is a symlink into this repo, so editing it *is* editing the repo — there's no
separate "save" step:

```bash
cd ~/dotfiles
git add -A && git commit -m update && git push
```

### Add a new package

```bash
mkdir -p newpkg/.config/newapp
mv ~/.config/newapp/* newpkg/.config/newapp/
stow newpkg
```

---

## NixOS — flake + Home Manager

`home.nix` uses Home Manager's `mkOutOfStoreSymlink` for each package, so — same as `stow` — it symlinks
straight into this repo rather than copying into the Nix store. Editing a tracked file is still just
edit → commit → push; a rebuild is only needed when a whole package is added or removed from `home.nix`.

`flake.nix` and `home.nix` are shared across every host (same dotfiles, same user, regardless of which
machine); only `nixos/hosts/<host>/` differs per machine.

### Fresh install — brand new machine, nothing on disk yet

1. Boot the NixOS installer ISO, connect to the network (`nmtui` if Wi-Fi).

2. Partition and format the disk. Simplest UEFI layout, with swap — adjust to taste (LUKS, btrfs, swap
   size, etc. are your call, not covered here):

   ```bash
   lsblk
   sudo cfdisk /dev/sda
   # label gpt
   # 1:  1GiB   EFI System
   # 2:  8GiB   Linux swap
   # 3:  resto  Linux filesystem

   mkfs.fat -F32 -n BOOT /dev/sda1
   mkswap -L swap /dev/sda2
   mkfs.ext4 -L nixos /dev/sda3

   swapon /dev/sda2
   mount /dev/sda3 /mnt
   mount --mkdir /dev/sda1 /mnt/boot
   ```

   `swapon` before `nixos-generate-config` (next step) matters: it only detects and writes a `swapDevices`
   entry into `hardware-configuration.nix` if the swap partition is already active at generation time.

3. Get git and clone this repo onto the target disk (HTTPS avoids needing an SSH key in the live ISO; switch
   the remote to SSH after first boot):

   ```bash
   nix-shell -p git
   git clone https://github.com/mrodrigs/dotfiles.git /mnt/home/mauricio/dotfiles
   ```

4. Generate this machine's hardware config straight into the repo, under a folder named for this host
   (replaces the placeholder if reusing an existing host name like `pc`):

   ```bash
   nixos-generate-config --root /mnt --show-hardware-config > /mnt/home/mauricio/dotfiles/nixos/hosts/pc/hardware-configuration.nix
   ```

5. Review before installing:
   - `nixos/hosts/pc/configuration.nix` — `system.stateVersion`, timezone, bootloader (`systemd-boot` vs
     `grub`, matches the ESP partition from step 2)
   - `home.nix` — `home.stateVersion` (keep in sync with `system.stateVersion`), and that every name in
     `home.packages` still exists in nixpkgs (`nix search nixpkgs <name>`, from the `nix-shell` in step 3)

6. Install using the flake instead of the generated default config:

   ```bash
   nixos-install --root /mnt --flake /mnt/home/mauricio/dotfiles#pc
   ```

   Prompts for the root password. Reboot into the new system once it finishes.

7. First login as `mauricio`: the dotfiles are already at `~/dotfiles` (that's what
   `/mnt/home/mauricio/dotfiles` became), Hyprland/waybar/etc. are already live via Home Manager. Add an SSH
   key and switch the remote:

   ```bash
   ssh-keygen -t ed25519 -C mauricio@pc   # add the pubkey to GitHub
   cd ~/dotfiles && git remote set-url origin git@github.com:mrodrigs/dotfiles.git
   ```

### Add this flake to an already-installed NixOS box

```bash
git clone git@github.com:mrodrigs/dotfiles.git ~/dotfiles
cd ~/dotfiles
sudo nixos-generate-config --show-hardware-config > nixos/hosts/pc/hardware-configuration.nix
# same review as step 5 above
sudo nixos-rebuild switch --flake ~/dotfiles#pc
```

### Update

```bash
cd ~/dotfiles
git add -A && git commit -m update && git push
```

Rebuild (`sudo nixos-rebuild switch --flake ~/dotfiles#pc`) only if `home.nix`, `configuration.nix`, or
`flake.nix` itself changed — not needed for edits inside an already-linked package.

### Add a new package

```bash
mkdir -p newpkg/.config/newapp
mv ~/.config/newapp/* newpkg/.config/newapp/
```

Then add it to `home.nix`'s `home.file` block:

```nix
".config/newapp".source = link "newpkg/.config/newapp";
```

And apply:

```bash
sudo nixos-rebuild switch --flake ~/dotfiles#pc
```
