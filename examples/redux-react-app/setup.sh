yarn global add yalc

cd ../../
app=$(pwd)

cd $app/geppetto.js/geppetto-core
yarn && yarn build && yarn publish:yalc

cd $app/geppetto.js/geppetto-ui
yarn && yarn build && yarn publish:yalc

cd $app/geppetto.js/geppetto-client
yarn && yarn build && yarn publish:yalc