{ config, pkgs, ... }:

let
  dotfiles = "${config.home.homeDirectory}/dotfiles";
  link = path: config.lib.file.mkOutOfStoreSymlink "${dotfiles}/${path}";
in
{
  home.username = "mauricio";
  home.homeDirectory = "/home/mauricio";
  home.stateVersion = "26.05";

  home.packages = with pkgs; [
    neovim
    lazygit
    gcc
    tmux
    ghostty
    # Used directly by hypr/scripts/*.sh and hypr/{autostart,hypridle}.conf —
    # not pulled in by `programs.hyprland.enable`.
    jq
    hyprlock
    hypridle
    brightnessctl
    libnotify
    xdg-terminal-exec
  ];

  # Package + ~/.config/noctalia come from the home-manager module (see flake.nix);
  # launched via hypr/autostart.conf like the other bar/launcher/notification daemons.
  programs.noctalia.enable = true;

  home.file = {
    ".config/hypr".source = link "hypr/.config/hypr";
    ".config/nvim".source = link "nvim/.config/nvim";
    ".config/tmux/tmux.conf".source = link "tmux/.config/tmux/tmux.conf";
    "dev/tmux-statusbar".source = link "tmux/dev/tmux-statusbar";
    ".config/ghostty/config".source = link "ghostty/.config/ghostty/config";
    ".config/fish".source = link "fish/.config/fish";
    ".config/git".source = link "git/.config/git";
    ".XCompose".source = link "xcompose/.XCompose";
  };
}
