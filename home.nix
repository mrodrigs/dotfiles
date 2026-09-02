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
    waybar
    walker
    mako
    swayosd
    neovim
    tmux
    ghostty
  ];

  home.file = {
    ".config/hypr".source = link "hypr/.config/hypr";
    ".config/waybar".source = link "waybar/.config/waybar";
    ".config/walker".source = link "walker/.config/walker";
    ".config/mako".source = link "mako/.config/mako";
    ".config/swayosd".source = link "swayosd/.config/swayosd";
    ".config/nvim".source = link "nvim/.config/nvim";
    ".config/tmux/tmux.conf".source = link "tmux/.config/tmux/tmux.conf";
    "dev/tmux-statusbar".source = link "tmux/dev/tmux-statusbar";
    ".config/ghostty/config".source = link "ghostty/.config/ghostty/config";
    ".config/fish".source = link "fish/.config/fish";
    ".config/git".source = link "git/.config/git";
    ".XCompose".source = link "xcompose/.XCompose";
  };
}
