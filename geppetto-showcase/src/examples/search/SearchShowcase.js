import React, { Component } from 'react';
import Search from '@metacell/geppetto-meta-ui/search/Search';
import { Button } from "@mui/material";

export default class SearchShowcase extends Component {
  constructor (props) {
    super(props);
    this.searchStyle = require('./searchConfiguration').searchStyle;
    this.searchConfiguration = require('./searchConfiguration').searchConfiguration;
    this.datasourceConfiguration = require('./searchConfiguration').datasourceConfiguration;
  }

  render () {
    var that = this;

    return (
      <div>
        <Button
          onClick={ () => {
            that.refs.searchRef.openSearch(true)
            window.scrollTo(0,0)
          }}
          variant="contained"
          color="primary">
          Open Search
        </Button>

        <Search ref="searchRef"
          datasource="SOLR"
          searchStyle={this.searchStyle}
          searchConfiguration={this.searchConfiguration}
          datasourceConfiguration={this.datasourceConfiguration} />
      </div>
    );
  }
}
