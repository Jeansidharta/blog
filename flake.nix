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
          npmDepsHash = "sha256-BWZCER5BL7ZaHfXFhO1f7ta1np4hoEv91RWhw1XVlS4=";
        };
      in
      {
        devShell = pkgs.mkShell { buildInputs = with pkgs; [ nodePackages_latest.nodejs ]; };
        packages.default = pkgs.runCommand "sidharta-blog" { } ''
          cp -r ${npmPackage}/website $out
        '';
      }
    );
}
