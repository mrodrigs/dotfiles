{ pkgs, ... }:

{
  system.stateVersion = "26.05";

  networking.networkmanager.enable = true;

  nix.settings.experimental-features = [ "nix-command" "flakes" ];

  nixpkgs.config.allowUnfree = true;

  fonts = {
    packages = with pkgs; [ nerd-fonts.jetbrains-mono ];
    fontconfig.defaultFonts = {
      serif = [ "JetBrainsMono Nerd Font" ];
      sansSerif = [ "JetBrainsMono Nerd Font" ];
      monospace = [ "JetBrainsMono Nerd Font Mono" ];
    };
  };

  time.timeZone = "America/Sao_Paulo";
  i18n.defaultLocale = "en_US.UTF-8";
  i18n.inputMethod = {
    enable = true;
    type = "fcitx5";
  };

  security.rtkit.enable = true;
  services.pipewire = {
    enable = true;
    alsa.enable = true;
    pulse.enable = true;
  };

  services.gvfs.enable = true;
  services.udisks2.enable = true;

  security.polkit.enable = true;
  systemd.user.services.polkit-gnome-authentication-agent-1 = {
    description = "polkit-gnome-authentication-agent-1";
    wantedBy = [ "graphical-session.target" ];
    wants = [ "graphical-session.target" ];
    after = [ "graphical-session.target" ];
    serviceConfig = {
      Type = "simple";
      ExecStart = "${pkgs.polkit_gnome}/libexec/polkit-gnome-authentication-agent-1";
      Restart = "on-failure";
    };
  };

  services.getty.autologinUser = "mauricio";
  services.openssh.enable = true;

  programs.hyprland = {
    enable = true;
    withUWSM = true;
  };
  programs.steam.enable = true;

  xdg.portal = {
    enable = true;
    extraPortals = [ pkgs.xdg-desktop-portal-hyprland pkgs.xdg-desktop-portal-gtk ];
  };
  programs.fish = {
    enable = true;
    shellAliases = {
      ags-restart = "ags quit; systemctl --user restart ags.service";
      tl = "tmux list-sessions";
    };
    shellFunctions = {
      tmux.body = ''
        if test (count $argv) -gt 0
          command tmux $argv
            return
            end

            if command tmux has-session 2>/dev/null
              command tmux attach
                return
                end

                if test -e ~/.local/share/tmux/resurrect/last
                  for i in (seq 1 15)
                    sleep 0.2
                      if command tmux has-session 2>/dev/null
                        command tmux attach
                          return
                          end
                          end
                          end

                          command tmux new-session -s main
                          '';
      ta.body = ''
        tmux attach -t $argv[1]
        '';
      tk.body = ''
        tmux kill-session -t $argv[1]
        '';
      ts.body = ''
        tmux new-session -s $argv[1]
        '';
    };
    loginShellInit = ''
      if uwsm check may-start >/dev/null 2>&1
        exec systemd-cat -t uwsm_start uwsm start -- start-hyprland
          end
          '';
    interactiveShellInit = ''
      set -g fish_greeting
      set -U tide_pwd_bg_color 525252
      set -U tide_pwd_color_dirs f2f4f8
      set -U tide_pwd_color_truncated_dirs f2f4f8
      set -U tide_pwd_color_anchors f2f4f8
      '';
  };

  users.users.mauricio = {
    isNormalUser = true;
    extraGroups = [ "wheel" "networkmanager" ];
    shell = pkgs.fish;
  };

  environment.systemPackages = with pkgs; [
    git
    fishPlugins.tide
  ];
}
