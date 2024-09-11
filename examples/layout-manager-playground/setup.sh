#!/usr/bin/env bash

# Trick to have folder relative to the script, not CWD
PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "${PARENT_PATH}"

# Install the libraries (if not already installed)
GEPPETTO_JS="../../geppetto.js"

(bash "${GEPPETTO_JS}/dev-install.sh")
(cd "${GEPPETTO_JS}/geppetto-core" && yarn build:dev)
(cd "${GEPPETTO_JS}/geppetto-ui" && yarn build:dev)
(cd "${GEPPETTO_JS}/geppetto-client" && yarn build:dev)

yarn install && yarn link:yalc