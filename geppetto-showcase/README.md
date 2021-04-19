<p align="center">
  <img src="https://github.com/tarelli/bucket/blob/master/geppetto%20logo.png?raw=true" alt="Geppetto logo"/>
</p>

## Geppetto Showcase

Geppetto Meta showcase of components & features

## Development

1. `cd geppetto.js`
2. `yalc publish`
3. `cd ../geppetto-showcase`   
4. `yalc add @geppettoengine/geppetto-client`   
5. `yarn`
6. `yarn start`

(optional)
7. `npm install -g nodemon`
8. `cd ../geppetto.js`
9. `nodemon -x 'yalc push'`



## Deployment

Build Dockerfile from root level of geppetto-meta repository:

```bash
docker build -t geppetto-showcase .
```

Start container with:

````bash
docker run -p 8080:80 geppetto-showcase 
````
