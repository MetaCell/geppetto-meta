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

Create a release branch `release/v.x.x.x`.

And follow the steps for each package below.

* first of all do a `npm login` (you will need 2FA enable on your account before proceeding)

**geppetto-ui**

* Increase version in `geppetto-ui/package.json` to new version.
* Create build

  ```bash
  cd geppetto-ui
  yarn && yarn build
  ```
* Publish build
  
  ```bash
  cd build
  npm publish --access public
  ```

**geppetto-core**

Equivalent to geppetto-ui.


**geppetto-client**

geppetto-client defines `@metacell/geppetto-meta-ui` and `@metacell/geppetto-meta-core` as dependencies.

Therefore, two additional steps are necessary:
* First create releases for core and ui before creating release for client.
* Further, update dependency version of core and ui in geppetto-client to new release version.

Once completed, proceed with the usual steps.

   
