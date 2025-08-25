#!/usr/bin/env bash

DERIVATION=$(nix store make-content-addressed . --json | jq -r ".rewrites.[]" )

nix-copy-closure rpi "$DERIVATION"
ssh rpi "rm -f /var/www/html/sidharta-blog && ln -s $DERIVATION /var/www/html/sidharta-blog"
