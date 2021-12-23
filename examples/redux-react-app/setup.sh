yarn global add yalc

cd ../../
app=$(pwd)

cd $app/geppetto.js/geppetto-core
yarn && yarn build:dev && yarn publish:yalc

cd $app/geppetto.js/geppetto-ui
yarn && yarn build:dev && yarn publish:yalc

cd $app/geppetto.js/geppetto-client
yarn && yarn build:dev && yarn publish:yalc

cd $app/examples/redux-react-app

yalc add @metacell/geppetto-meta-client
yalc add @metacell/geppetto-meta-core
yalc add @metacell/geppetto-meta-ui

yarn
