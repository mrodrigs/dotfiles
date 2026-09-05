{ ... }:

{
  imports = [ ../../common.nix ./hardware-configuration.nix ];

  networking.hostName = "vm";

  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;
}
