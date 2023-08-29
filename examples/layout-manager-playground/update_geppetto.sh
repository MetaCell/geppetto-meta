cwd=$(pwd)
cd ../../geppetto.js/geppetto-client
yarn build:dev  && yarn publish:yalc
cd $cwd
npm upgrade @metacell/geppetto-meta-client --legacy-peer-deps