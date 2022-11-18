import React, { Component } from 'react'
import NRRDViewer from "@metacell/geppetto-meta-ui/nrrd-viewer/NRRDViewer";


export default class NRRDViewerShowcase extends Component {
  constructor (props) {
    super(props);
    this.viewerRef = React.createRef();
  }

  render () {
    const controls = {
      playAtStart: false,
      loop: false,
      volume: 1,
      playbackRate: 1,
    };
    const videoURL = "https://youtu.be/OmwXCGPBhNo";
    const width = "800px";
    const height = "640px";

    return (
      <NRRDViewer ref={this.viewerRef} />
    );
  }
}