{ config, lib, pkgs, astal, ags, ... }:

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
    package = pkgs.catppuccin-cursors.lattePink;
    name = "catppuccin-latte-pink-cursors";
    size = 24;
  };

  gtk = {
    enable = true;
    theme = {
      name = "Adwaita-dark";
      package = pkgs.gnome-themes-extra;
    };
    font.name = "JetBrainsMono Nerd Font 10";
    gtk4.extraConfig.gtk-application-prefer-dark-theme = true;
    gtk3.extraCss = ''
      @define-color theme_selected_bg_color #ee5396;
      @define-color theme_selected_fg_color #161616;
    '';
  };

  qt = {
    enable = true;
    platformTheme.name = "gtk3";
    style.name = "adwaita-dark";
  };

  dconf.settings."org/gnome/desktop/interface" = {
    color-scheme = "prefer-dark";
    gtk-theme = "Adwaita-dark";
  };

  xdg.desktopEntries.thunar = {
    name = "Thunar File Manager";
    icon = "org.xfce.thunar";
    exec = "env GTK_THEME=oxocarbon-ags thunar %U";
    terminal = false;
    type = "Application";
    categories = [ "System" "Core" "GTK" "FileTools" "FileManager" ];
    mimeType = [ "inode/directory" ];
  };

  xdg.desktopEntries.pxg = {
    name = "PXG";
    genericName = "PokeXGames";
    icon = "${config.home.homeDirectory}/pxg/assets/pxgmeclient.png";
    exec = "env --chdir=${config.home.homeDirectory}/pxg steam-run ${config.home.homeDirectory}/pxg/pxgme-linux";
    terminal = false;
    type = "Application";
    categories = [ "Game" ];
  };

  programs.ags = {
    enable = true;
    extraPackages = with astal.packages.${pkgs.stdenv.hostPlatform.system}; [ io astal4 hyprland apps wireplumber notifd network bluetooth ];
    configDir = link "ags/.config/ags";
    systemd.enable = true;
  };

  systemd.user.services.ags.Unit.After = [ "graphical-session.target" ];
  systemd.user.services.ags.Service.KillMode = lib.mkForce "process";

  fonts.fontconfig.enable = true;

  home.packages = with pkgs; [
    neovim
    lazygit
    gcc
    ripgrep
    fd
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
    xfce.thunar
    xfce.thunar-volman
    xfce.tumbler
    # Used directly by hypr/scripts/*.sh and hypr/{autostart,hypridle}.conf —
    # not pulled in by `programs.hyprland.enable`.
    jq
    hyprlock
    hypridle
    hyprpaper
    hyprshot
    grim
    wl-clipboard
    brightnessctl
    libnotify
    xdg-terminal-exec
  ];

  home.file = {
    ".config/hypr".source = link "hypr/.config/hypr";
    ".config/nvim".source = link "nvim/.config/nvim";
    ".config/tmux/tmux.conf".source = link "tmux/.config/tmux/tmux.conf";
    "dev/tmux-dotbar".source = link "tmux/dev/tmux-dotbar";
    ".config/ghostty/config".source = link "ghostty/.config/ghostty/config";
    ".config/git".source = link "git/.config/git";
    ".themes/oxocarbon-ags".source = link "gtk/.themes/oxocarbon-ags";
    ".XCompose".source = link "xcompose/.XCompose";
  };
}
