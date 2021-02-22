<p align="center">
  <img src="https://github.com/tarelli/bucket/blob/master/geppetto%20logo.png?raw=true" alt="Geppetto logo"/>
</p>

# Geppetto Website

Geppetto's Website

## Geppetto Showcase

Geppetto's showcase of components & features

## How to develop

1. `git clone -b development https://github.com/MetaCell/geppetto-website.git`
2. `cd geppetto-website`
3. `git clone -b development https://github.com/openworm/geppetto-client.git`
4. `yarn`
5. `npm start`


# Subtree fork management

To pull from a dedicated open source repo:

```
git remote add js https://github.com/openworm/geppetto-client.git
git remote pull --prefix geppetto.js js [BRANCH_NAME]
```


```
git remote add pygeppetto https://github.com/openworm/pygeppetto.git
git remote pull --prefix pygeppetto pygeppetto [BRANCH_NAME]
```

```
git remote add jupyter https://github.com/openworm/org.geppetto.frontend.jupyter.git
git remote pull --prefix jupyter-geppetto jupyter [BRANCH_NAME]
```
