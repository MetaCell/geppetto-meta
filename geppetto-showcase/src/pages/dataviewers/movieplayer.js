import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import MoviePlayerMarkdown from "@metacell/geppetto-meta-ui/movie-player/README.md";


export default class MoviePlayer extends Component {
  render () {
    const { currentPageHandler } = this.props;

    return (
      <Showcase
        markdown={MoviePlayerMarkdown}
        currentPageHandler={currentPageHandler}
      />
    );
  }
}
