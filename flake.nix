{
  description = "Mauricio's NixOS + Home Manager flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    serpantinum.url = "github:ilyamiro/serpantinum";
  };

  outputs = { nixpkgs, home-manager, serpantinum, ... }: {
    nixosConfigurations.pc = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      specialArgs = { inherit serpantinum; };
      modules = [
        ./nixos/hosts/pc/configuration.nix
        serpantinum.nixosModules.default
        home-manager.nixosModules.home-manager
        {
          home-manager.useGlobalPkgs = true;
          home-manager.useUserPackages = true;
          home-manager.extraSpecialArgs = { inherit serpantinum; };
          home-manager.users.mauricio = {
            imports = [ ./home.nix ];
          };
        }
      ];
    };
  };
}
