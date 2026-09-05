{
  description = "Mauricio's NixOS + Home Manager flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { nixpkgs, home-manager, ... }:
  let
    mkHost = hostConfig: nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        hostConfig
        home-manager.nixosModules.home-manager
        {
          home-manager.useGlobalPkgs = true;
          home-manager.useUserPackages = true;
          home-manager.users.mauricio = {
            imports = [ ./home.nix ];
          };
        }
      ];
    };
  in {
    nixosConfigurations = {
      vm = mkHost ./nixos/hosts/vm/configuration.nix;
      pc = mkHost ./nixos/hosts/pc/configuration.nix;
    };
  };
}
