yarn global add yalc

app=$(pwd)

cd $app/geppetto.js/geppetto-core
yarn && yarn build && yarn publish:yalc

cd $app/geppetto.js/geppetto-client
yarn && yarn build && yarn publish:yalc

cd $app/geppetto.js/geppetto-ui
yarn && yarn build:src && yarn publish:yalc

cd $app/geppetto-showcase
yalc add @metacell/geppetto-meta-client
yalc add @metacell/geppetto-meta-core
yalc add @metacell/geppetto-meta-ui

yarn && yarn start
