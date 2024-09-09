#!/usr/bin/env bash

# Trick to have folder relative to the script, not CWD
PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "${PARENT_PATH}"

# Install and init the projects first in reverse order (the most dependent first)
# each "init" script is linking the projects using yalc
(cd geppetto-client && yarn install && yarn link:yalc)
(cd geppetto-ui && yarn install && yarn link:yalc)
(cd geppetto-core && yarn install && yarn link:yalc)
