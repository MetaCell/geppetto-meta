#!/usr/bin/env sh

# Trick to have folder relative to the script, not CWD
PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "${PARENT_PATH}"


GEPPETTO_JS="../../geppetto.js"
(cd "${GEPPETTO_JS}/geppetto-core" && yarn watch) &
(cd "${GEPPETTO_JS}/geppetto-ui" && yarn watch) &
(cd "${GEPPETTO_JS}/geppetto-client" && yarn watch) &