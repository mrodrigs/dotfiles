{ config, pkgs, astal, ags, ... }:

let
  dotfiles = "${config.home.homeDirectory}/dotfiles";
  link = path: config.lib.file.mkOutOfStoreSymlink "${dotfiles}/${path}";
in
{
  imports = [
    ags.homeManagerModules.default
  ];

  home.username = "mauricio";
  home.homeDirectory = "/home/mauricio";
  home.stateVersion = "26.05";

  home.pointerCursor = {
    enable = true;
    gtk.enable = true;
    package = pkgs.catppuccin-cursors.mochaPink;
    name = "catppuccin-mocha-pink-cursors";
    size = 24;
  };

  programs.ags = {
    enable = true;
    extraPackages = with astal.packages.${pkgs.stdenv.hostPlatform.system}; [ io astal4 ];
  };

  home.packages = with pkgs; [
    neovim
    lazygit
    gcc
    tmux
    ghostty
    chromium
    spotify
    claude-code
    discord
    teamspeak3
    htop
    btop
    obs-studio
    zapzap
    # Used directly by hypr/scripts/*.sh and hypr/{autostart,hypridle}.conf —
    # not pulled in by `programs.hyprland.enable`.
    jq
    hyprlock
    hypridle
    brightnessctl
    libnotify
    xdg-terminal-exec
  ];

  home.file = {
    ".config/hypr".source = link "hypr/.config/hypr";
    ".config/nvim".source = link "nvim/.config/nvim";
    ".config/tmux/tmux.conf".source = link "tmux/.config/tmux/tmux.conf";
    "dev/tmux-statusbar".source = link "tmux/dev/tmux-statusbar";
    ".config/ghostty/config".source = link "ghostty/.config/ghostty/config";
    ".config/git".source = link "git/.config/git";
    ".XCompose".source = link "xcompose/.XCompose";
  };
}
