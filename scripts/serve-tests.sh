#!/bin/sh
# Builds the site once per test fixture and serves each build on its own port.
# Playwright starts this (playwright.config.ts). GitHub Pages serves the site
# under /site/, so each build goes into that folder.
set -e
build() { # fixture, folder
  rm -rf "test-out/$2"
  RELEASES_FILE="./tests/fixtures/$1.json" SITE_OUT="test-out/$2/site" npx vite build --logLevel error
}
build two two
build empty empty
python3 -m http.server 4102 --bind 127.0.0.1 -d test-out/empty >/dev/null 2>&1 &
exec python3 -m http.server 4101 --bind 127.0.0.1 -d test-out/two >/dev/null 2>&1
