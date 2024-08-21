#!/usr/bin/env sh

# Install and init the projects first in reverse order (the most dependent first)
# each "init" script is linking the projects using yalc
(cd geppetto-client && yarn install && yarn link:yalc)
(cd geppetto-ui && yarn install && yarn link:yalc)
(cd geppetto-core && yarn install && yarn link:yalc)
