import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase.jsx";
import NRRD3DMarkdown from '@metacell/geppetto-meta-ui/nrrd-viewer/README.md';


export default class NRRDViewer extends Component {
  render () {
    const { currentPageHandler } = this.props;

    return (
      <Showcase
        markdown={NRRD3DMarkdown}
        currentPageHandler={currentPageHandler}
      />
    );
  }
}