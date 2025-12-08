{
  inputs = {
    utils.url = "github:numtide/flake-utils";
  };
  outputs =
    {
      self,
      nixpkgs,
      utils,
    }:
    utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        npmPackage = pkgs.buildNpmPackage {
          pname = "sidharta-blog";
          version = "0.0.1";
          src = ./.;
          npmDepsHash = "sha256-/Qrn/hUlXUeGzseOLbrXaOqjAHolSJFFCcV5uk4tqUg=";
        };
        website = pkgs.runCommand "sidharta-blog" { } ''
          cp -r ${npmPackage}/website $out
        '';
      in
      {
        devShell = pkgs.mkShell { buildInputs = with pkgs; [ nodePackages_latest.nodejs ]; };
        packages.default = website;
        packages.docker = pkgs.dockerTools.buildLayeredImage {
          name = "sidharta-blog";
          tag = "latest";
          contents = [
            pkgs.pkgsStatic.darkhttpd
          ];
          extraCommands = ''
            ln -s ${website} blog
          '';
        };
      }
    );
}
