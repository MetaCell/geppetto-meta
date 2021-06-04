<p align="center">
  <img src="https://github.com/tarelli/bucket/blob/master/geppetto%20logo.png?raw=true" alt="Geppetto logo"/>
</p>

## Geppetto Showcase

Geppetto Meta showcase of components & features

## Development

The geppetto-showcase depends on three local packages: geppetto-client, geppetto-ui, geppetto-core.

We use [yalc](https://github.com/wclr/yalc) as a local repository to manage these dependencies.

Install yalc
```bash
yarn global add yalc
```

Install geppetto-client

```bash
cd geppetto.js/geppetto-client
yarn && yarn build && yarn publish:yalc
```

Install geppetto-ui

```bash
cd geppetto.js/geppetto-ui
yarn && yarn build:src && yarn publish:yalc
```

Install geppetto-core

```bash
cd geppetto.js/geppetto-core
yarn && yarn build && yarn publish:yalc
```

Add these packages to geppetto-showcase

```bash
yalc add @geppettoengine/geppetto-client
yalc add @geppettoengine/geppetto-core
yalc add @geppettoengine/geppetto-ui
```   

Install dependencies

```bash
yarn
```

Start development server

```bash
yarn start
```

(optional for hot reloading)

```bash
yarn global add nodemon
cd ../geppetto.js/geppetto-ui
nodemon -w ./src -x 'yarn build:src && yalc push build'
```

## Deployment

Build Dockerfile from root level of geppetto-meta repository:

```bash
docker build -t geppetto-showcase .
```

Start container with:

````bash
docker run -p 8080:80 geppetto-showcase 
````
