#!/usr/bin/env bash

# Trick to have folder relative to the script, not CWD
PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "${PARENT_PATH}"

# Build @metacell/geppetto and register it globally via yarn link so that
# consumer apps can pick it up with `yarn link @metacell/geppetto`.
echo "[*] Install geppetto"
(cd geppetto && yarn install && yarn build:clean && yarn build && yarn link)
