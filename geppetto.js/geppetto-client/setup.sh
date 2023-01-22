yarn global add yalc

app=$(pwd)

cd ../geppetto-ui;
yarn && yarn build:dev && yarn publish:yalc

cd $app

yalc add @metacell/geppetto-meta-ui

yarn
