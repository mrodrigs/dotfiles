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

  services.getty.autologinUser = "mauricio";
  services.openssh.enable = true;

  programs.hyprland = {
    enable = true;
    withUWSM = true;
  };
  programs.fish.enable = true;

  users.users.mauricio = {
    isNormalUser = true;
    extraGroups = [ "wheel" "networkmanager" ];
    shell = pkgs.fish;
  };

  environment.systemPackages = with pkgs; [
    git
  ];
}
