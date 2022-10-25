import React, { Component } from 'react';
import {
  createStore,
  applyMiddleware,
  compose
} from 'redux';

const { CorePlugin: corePlugin } = plugins

class GriddleNoReduxBrowserExtension extends Griddle {

  constructor (props) {
    super(props);

    const { core = corePlugin, storeKey = GriddleNoReduxBrowserExtension.storeKey || 'store' } = props;

    const { initialState, reducer, reduxMiddleware } = init.call(this, core);

    this.store = createStore(
      reducer,
      initialState,
      compose(applyMiddleware(...reduxMiddleware))
    );
  }
}

GriddleNoReduxBrowserExtension.storeKey = 'store';

export default GriddleNoReduxBrowserExtension;
