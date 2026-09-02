{ pkgs, ... }:

{
  imports = [ ./hardware-configuration.nix ];

  system.stateVersion = "26.05";

  networking.hostName = "pc";
  networking.networkmanager.enable = true;

  nix.settings.experimental-features = [ "nix-command" "flakes" ];

  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;

  time.timeZone = "America/Sao_Paulo";
  i18n.defaultLocale = "en_US.UTF-8";
  i18n.inputMethod = {
    enable = true;
    type = "fcitx5";
  };

  # hypr/autostart.conf starts fcitx5/hypridle/waybar/mako itself via
  # exec-once, but the audio stack and the polkit agent need real services.
  security.rtkit.enable = true;
  services.pipewire = {
    enable = true;
    alsa.enable = true;
    pulse.enable = true;
  };

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

  # hypr/xdph.conf configures the screenshare picker — needs the portal itself.
  xdg.portal = {
    enable = true;
    extraPortals = [ pkgs.xdg-desktop-portal-hyprland ];
  };
  programs.fish = {
    enable = true;
    loginShellInit = ''
      if uwsm check may-start
        exec systemd-cat -t uwsm_start uwsm start -- Hyprland
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
  ];
}
