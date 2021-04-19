<p align="center">
  <img src="https://github.com/tarelli/bucket/blob/master/geppetto%20logo.png?raw=true" alt="Geppetto logo"/>
</p>

## Geppetto Showcase

Geppetto Meta showcase of components & features

## Development

1. `yarn global add yalc`
2. `cd geppetto.js`
3. `yalc publish`
4. `cd ../geppetto-showcase`   
5. `yalc add @geppettoengine/geppetto-client`   
6. `yarn`
7. `yarn start`

(optional for hot reloading)
8. `yarn global add nodemon`
9. `cd ../geppetto.js`
10. `nodemon -x 'yalc push'`



## Deployment

Build Dockerfile from root level of geppetto-meta repository:

```bash
docker build -t geppetto-showcase .
```

Start container with:

````bash
docker run -p 8080:80 geppetto-showcase 
````
