yarn global add yalc

cd ../../
app=$(pwd)

cd $app/geppetto.js/geppetto-core
yarn && yarn build:dev && yarn publish:yalc

cd $app/geppetto.js/geppetto-ui
yarn && yarn build:dev && yarn publish:yalc

cd $app/geppetto.js/geppetto-client
yarn && yarn build:dev && yarn publish:yalc

cd $app/examples/layout-manager-playground

yalc add @metacell/geppetto-meta-client
yalc add @metacell/geppetto-meta-core
yalc add @metacell/geppetto-meta-ui

npm install --legacy-peer-deps # yarn does not create links!
