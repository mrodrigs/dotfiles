{ ... }:

{
  imports = [ ../../common.nix ./hardware-configuration.nix ];

  networking.hostName = "pc";

  boot.loader.grub.enable = true;
  boot.loader.grub.efiSupport = true;
  boot.loader.grub.device = "nodev";
  boot.loader.grub.efiInstallAsRemovable = false;
  boot.loader.grub.useOSProber = false;
  boot.loader.efi.canTouchEfiVariables = false;
  boot.loader.efi.efiSysMountPoint = "/boot";
}
