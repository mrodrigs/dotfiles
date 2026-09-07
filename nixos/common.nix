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

  # hypr/autostart.conf starts fcitx5/hypridle itself via
  # exec-once, but the audio stack and the polkit agent need real services.
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

  # hypr/xdph.conf configures the screenshare picker — needs the portal itself.
  xdg.portal = {
    enable = true;
    extraPortals = [ pkgs.xdg-desktop-portal-hyprland pkgs.xdg-desktop-portal-gtk ];
  };
  programs.fish = {
    enable = true;
    shellAliases = {
      ags-restart = "ags quit; systemctl --user restart ags.service";
    };
    shellFunctions = {
      tm.body = ''
        if tmux has-session 2>/dev/null
          tmux attach
          return
        end

        if test -e ~/.local/share/tmux/resurrect/last
          for i in (seq 1 15)
            sleep 0.2
            if tmux has-session 2>/dev/null
              tmux attach
              return
            end
          end
        end

        tmux new-session -s main
      '';
    };
    loginShellInit = ''
      if uwsm check may-start
        exec systemd-cat -t uwsm_start uwsm start -- start-hyprland
      end
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
