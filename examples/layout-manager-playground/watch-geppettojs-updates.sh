#!/usr/bin/env sh

# Trick to have folder relative to the script, not CWD
PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "${PARENT_PATH}"

function kill_subprocess(){
    kill $(jobs -p -r)
}

GEPPETTO_JS="../../geppetto.js"
(cd "${GEPPETTO_JS}/geppetto-core" && yarn watch) &
(cd "${GEPPETTO_JS}/geppetto-ui" && yarn watch) &
(cd "${GEPPETTO_JS}/geppetto-client" && yarn watch) &

trap kill_subprocess INT
wait