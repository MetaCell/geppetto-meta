[![Build Status](https://travis-ci.org/openworm/org.geppetto.frontend.png?branch=master)](https://travis-ci.org/openworm/org.geppetto.frontend)

<p align="center">
  <img src="https://github.com/tarelli/bucket/blob/master/geppetto%20logo.png?raw=true" alt="Geppetto logo"/>
</p>

# Geppetto Client

This is the client library of Geppetto which includes all the frontend components and widgets, the WebSocket API implementation to talk to the backend and all the infrastructure to manage the Geppetto Model in Javascript.

For information about how this fits into [Geppetto](http://www.geppetto.org/) refer to the umbrella project [org.geppetto](https://github.com/openworm/org.geppetto) on GitHub.

# Geppetto Core

The Core components of Geppetto.js (work in progress)

# Geppetto UI

The UI components of Geppetto.js (work in progress)

# Release

Ensure that you have an npm account associated with `metacell` organization and that you're logged in with `npm login`.

Create a release branch `release/x.x.x`.

And follow the steps for each package below.

* first of all do a `npm login` (you will need 2FA enable on your account before proceeding)

Run **npm cache clear --force** first

**geppetto-core**

Start with this one as there are no other *geppetto-meta* dependencies needed

Update version on package.json

```
rm -rf node_modules build package-lock.json yarn.lock 
npm install
npm run build
cd build
npm publish --access public
```

**geppetto-ui**

Update version on package.json
Update *geppetto-meta-core* reference on package.json *peerDependencies*

```
rm -rf node_modules build package-lock.json yarn.lock 
npm install
npm run build
cd build
npm publish --access public
```

**geppetto-client**

Update version on package.json
Update *geppetto-meta-core and geppetto-meta-ui* reference on package.json *peerDependencies*

```
rm -rf node_modules build package-lock.json yarn.lock 
npm install
npm run build
cd build
npm publish --access public
```
