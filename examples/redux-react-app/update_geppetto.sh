cd ../../geppetto.js/geppetto-core
yarn build:dev  && yalc push --sig && yarn publish:yalc
cd ../geppetto-ui
yarn build:dev  && yalc push --sig && yarn publish:yalc
cd ../geppetto-client
yarn build:dev  && yalc push --sig && yarn publish:yalc