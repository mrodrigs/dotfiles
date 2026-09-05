{ config, pkgs, serpantinum, ... }:

let
  dotfiles = "${config.home.homeDirectory}/dotfiles";
  link = path: config.lib.file.mkOutOfStoreSymlink "${dotfiles}/${path}";
in
{
  imports = [
    serpantinum.homeManagerModules.default
  ];

  home.username = "mauricio";
  home.homeDirectory = "/home/mauricio";
  home.stateVersion = "26.05";

  programs.serpantinum = {
    enable = true;
    systemd.enable = true;

    settings = {
      wallpaperDir = "${config.home.homeDirectory}/Pictures/Wallpapers";

      general = {
        language = "en";
        weatherUnit = "metric";
        weatherInterval = 30;
      };

      bar = {
        position = "top";
        style = "solid";
        width = 40;
        workspaceCount = 10;
        modules = {
          left = [ "workspaces" ];
          center = [ "time" ];
          right = [ "tray" [ "kb" "wifi" "bt" "vol" "bat" ] ];
        };
      };

      theme = {
        fontFamily = "Adwaita Mono";
        borderRadius = 12;
        matugen = true;
      };

      notifications = {
        dnd = false;
        position = "top right";
        sound = true;
      };
    };
  };

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
