# Placeholder — do NOT `nixos-rebuild` with this file as-is.
#
# This is machine-specific (disk UUIDs, filesystem layout) and can't be
# authored generically. Replace it once the real disk is partitioned,
# from the NixOS installer ISO, after mounting the new root at /mnt and
# the shared Arch/Limine ESP at /mnt/boot:
#
#   sudo nixos-generate-config --root /mnt
#
# ...then copy /mnt/etc/nixos/hardware-configuration.nix over this file.
{ ... }:
{ }
