#!/usr/bin/env bash

# Trick to have folder relative to the script, not CWD
PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "${PARENT_PATH}"

# Install and yalc-publish geppetto-core, geppetto-ui and geppetto-client.
# Build order is fixed: core → ui → client (each depends on the previous).
echo "[*] Install geppetto-core"
(cd geppetto-core && yarn install && yarn link:yalc && yarn build:clean && yarn build:dev && yarn publish:yalc)

echo "[*] Install geppetto-ui"
(cd geppetto-ui && yarn install && yarn link:yalc && yarn build:clean && yarn build:dev && yarn publish:yalc)

echo "[*] Install geppetto-client"
(cd geppetto-client && yarn install && yarn link:yalc && yarn build:clean && yarn build:dev && yarn publish:yalc)
