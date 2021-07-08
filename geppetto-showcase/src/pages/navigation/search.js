import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import SearchMarkdown from "@metacell/geppetto-meta-ui/search/README.md";


export default class Search extends Component {
  render () {
    const { currentPageHandler } = this.props;

    return (
      <Showcase
        markdown={SearchMarkdown}
        currentPageHandler={currentPageHandler}
      />
    );
  }
}
