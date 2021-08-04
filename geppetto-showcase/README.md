<p align="center">
  <img src="https://github.com/tarelli/bucket/blob/master/geppetto%20logo.png?raw=true" alt="Geppetto logo"/>
</p>

## Geppetto Showcase

Geppetto Meta showcase of components & features

## Development

The geppetto-showcase depends on three local packages: geppetto-client, geppetto-ui, geppetto-core.

We use [yalc](https://github.com/wclr/yalc) as a local repository to manage these dependencies.

The `./setup.sh` script will build and add the local geppetto packages to the showcase:

```bash
sh ./setup.sh
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
