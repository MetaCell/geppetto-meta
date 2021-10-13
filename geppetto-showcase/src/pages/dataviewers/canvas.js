import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import Canvas3DMarkdown from '../../showcases/3d-canvas/README.md';


export default class ThreeDCanvasPage extends Component {
  render () {
    const { currentPageHandler } = this.props;

    return (
      <Showcase
        markdown={Canvas3DMarkdown}
        currentPageHandler={currentPageHandler}
      />
    );
  }
}
