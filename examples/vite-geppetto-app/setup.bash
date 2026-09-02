#!/usr/bin/env bash
set -e

PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "${PARENT_PATH}"

# # Build ami.js fork and publish to local yalc store
# AMI_PATH="${PARENT_PATH}/../../../ami"
# if [ -d "${AMI_PATH}" ]; then
#   echo "[*] Building ami.js fork..."
#   (cd "${AMI_PATH}" && yarn install && yarn build && yalc publish)
# else
#   echo "WARNING: ami.js fork not found at ${AMI_PATH} — skipping"
# fi

# Build @metacell/geppetto and publish to local yalc store
GEPPETTO_PATH="${PARENT_PATH}/../../geppetto.js/geppetto"
echo "[*] Building @metacell/geppetto..."
(cd "${GEPPETTO_PATH}" && yarn install && yarn build:clean && yarn build && yalc publish)

# Install npm deps then link local packages from yalc store
echo "[*] Installing example dependencies..."
yarn install

echo ""
echo "Done. Run 'yarn dev' to start the dev server."
echo ""
echo "To pick up library changes during development:"
echo "  terminal 1: cd ${GEPPETTO_PATH} && yarn watch"
echo "  terminal 2: yarn dev"
