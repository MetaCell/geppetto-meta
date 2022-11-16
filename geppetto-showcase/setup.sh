yarn global add yalc

cd ../
app=$(pwd)

cd $app/geppetto.js/geppetto-core
rm -rf node_modules build
yarn && yarn build && yarn publish:yalc

cd $app/geppetto.js/geppetto-ui
rm -rf node_modules build
yarn && yarn build:src && yarn publish:yalc

cd $app/geppetto.js/geppetto-client
rm -rf node_modules build
yarn && yarn build && yarn publish:yalc

cd $app/geppetto-showcase
yalc add @metacell/geppetto-meta-client
yalc add @metacell/geppetto-meta-core
yalc add @metacell/geppetto-meta-ui

yarn
