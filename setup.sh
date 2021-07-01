yarn global add yalc

app=$(pwd)

cd $app/geppetto.js/geppetto-core
yarn && yarn build && yarn publish:yalc

cd $app/geppetto.js/geppetto-ui
yarn && yarn build && yarn publish:yalc

cd $app/geppetto.js/geppetto-client
yarn && yarn build && yarn publish:yalc

cd $app/examples/redux-react-app
yarn && yarn start