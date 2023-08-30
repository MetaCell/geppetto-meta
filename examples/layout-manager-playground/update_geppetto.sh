cwd=$(pwd)
cd ../../geppetto.js/geppetto-client
yarn build:dev  && yarn publish:yalc
cd $cwd
npm install --legacy-peer-deps