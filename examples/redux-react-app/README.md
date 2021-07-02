# React-Redux LayoutManager Example Application 

This application uses the geppetto-meta redux integration together with the LayoutManager and FlexLayout.

## Project Setup
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template.

## Development

**Build local geppetto dependencies**

Run the build gepeptto script

```
sh ./build_geppetto.sh
```

Run this script every time you change code in the local geppetto packages and want to test it in this application.


**Install dependencies**

```bash
yarn
```

**Start development server**

```bash
yarn start
```

See [Available Scripts](https://create-react-app.dev/docs/available-scripts) for more information.

## Geppetto LayoutManager Integration

1. Add `@metacell/geppetto-meta-client` as package dependency
2. Define a componentMap (see `src/app/componentMapp.js`) and add the components that you want to display in the tabs
3. Define a default layout (see `src/app/layout.js`)
4. Create the Redux store by using the `createStore` function in `@metacell/geppetto-meta-client/common`  (see `src/redux/store.js`) and pass the componentMap and layout
5. Add the Layout component to your App (see `src/app/showcase.js`)
