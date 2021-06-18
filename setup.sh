yarn global add yalc

app=${pwd}

cd geppetto.js/geppetto-client
yarn && yarn build && yarn publish:yalc

cd ../geppetto-ui
yarn && yarn build && yarn publish:yalc

cd ../geppetto-core
yarn && yarn build && yarn publish:yalc

cd ../../examples/redux-react-app
yarn && yarn start