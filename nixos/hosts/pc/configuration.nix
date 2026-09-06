{ ... }:

{
  imports = [ ../../common.nix ./hardware-configuration.nix ];

  networking.hostName = "pc";
  
  boot.loader.systemd-boot = {
    enable = true;
    xbootldrMountPoint = "/boot";
    configurationLimit = 15;
  };
  boot.loader.efi = {
    efiSysMountPoint = "/efi";
    canTouchEfiVariables = true;
  };
  boot.loader.timeout = 5;
}
