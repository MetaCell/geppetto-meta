yarn global add yalc
yarn cache clean
rm -rf package-lock.json
rm -rf yarn.lock
rm -rf node_modules
rm -rf dist

cd ../../yarn
app=$(pwd)

cd $app/geppetto.js/geppetto-core
rm -rf yarn.lock
yarn && yarn build && yarn publish:yalc

cd $app/geppetto.js/geppetto-ui
rm -rf yarn.lock
yarn && yarn build:src && yarn publish:yalc

cd $app/geppetto.js/geppetto-client
rm -rf yarn.lock
yarn && yarn build && yarn publish:yalc

cd $app/examples/redux-react-app
yalc add @metacell/geppetto-meta-client
yalc add @metacell/geppetto-meta-core
yalc add @metacell/geppetto-meta-ui

yarn
