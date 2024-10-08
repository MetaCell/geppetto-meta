# Getting Started with Create React App

This project was bootstrapped with [Vite](https://vitejs.dev/guide/) using React template.

To start develop, you need to setup yalc to link geppetto libraries to the current project.

To do so, run

```
bash setup.sh
```

## Available Scripts

You can run the project in dev or preview mode using `yarn dev` and `yarn preview`.
To build the project, use `yarn build`.

Here is a description of what each command is doing.

### `yarn dev`

Runs the app in the development mode.
Open [http://localhost:5143](http://localhost:5143) to view it in the browser (the port might be different on your machine, check the logs displayed by vite to be sure you are targeting the right address).

The page will reload if you make edits.
You will also see any lint errors in the console.

If you are developping at the same time on any of the geppetto.js lib (core, ui, client), you can run:

```
bash watch-geppettojs-updates.sh
```

This command will launch a `watch` on all the geppetto.js libraries and hot-reload the application if any of the source code of those dependencies changes.


### `yarn preview`

Runs the app in preview mode.
This means that a local webserver is launched to serve the app, but hot-reloading is not avaiable and the application is served from the `dist` directory where the application have been compiled/built.


### `yarn build`

Builds the app for production to the `dist` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

Your app is ready to be deployed!
