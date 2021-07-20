app=$(pwd)

cd $app/geppetto.js/geppetto-core
rm -rf node_modules build

cd $app/geppetto.js/geppetto-client
rm -rf node_modules build

cd $app/geppetto.js/geppetto-ui
rm -rf node_modules build

