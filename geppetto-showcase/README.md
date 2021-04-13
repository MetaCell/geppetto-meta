<p align="center">
  <img src="https://github.com/tarelli/bucket/blob/master/geppetto%20logo.png?raw=true" alt="Geppetto logo"/>
</p>

## Geppetto Showcase

Geppetto Meta showcase of components & features

## Development

1. `git clone -b development https://github.com/MetaCell/geppetto-meta.git`
2. `cd geppetto-meta/geppetto-showcase`
4. `yarn`
5. `yarn start`

## Deployment

Build Dockerfile from root level of geppetto-meta repository:

```bash
docker build -t geppetto-showcase .
```

Start container with:

````bash
docker run -p 8080:80 geppetto-showcase 
````
