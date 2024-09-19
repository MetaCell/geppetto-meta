#!/usr/bin/env bash

# Trick to have folder relative to the script, not CWD
PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "${PARENT_PATH}"

# Generates the openAPI specification
(cd backend && python genopenapi.py)

# Generates the typescript API binding
(cd frontend && yarn generate-client)
