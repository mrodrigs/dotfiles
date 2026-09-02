# Placeholder — do NOT `nixos-rebuild` with this file as-is.
#
# This is machine-specific (disk UUIDs, virtio/GPU drivers, filesystem
# layout) and can't be authored generically. Replace it with the real one:
#
#   inside the VM, once it can reach this repo (git clone/pull):
#   sudo nixos-generate-config --show-hardware-config > ~/dotfiles/nixos/hosts/pc/hardware-configuration.nix
#
# ...or just paste in the contents of the VM's current
# /etc/nixos/hardware-configuration.nix (from the tutorial install) — it's
# already correct for this VM, no need to regenerate it.
{ ... }:
{ }
