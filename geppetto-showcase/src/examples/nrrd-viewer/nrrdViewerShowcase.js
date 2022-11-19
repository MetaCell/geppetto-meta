import React, { Component } from 'react'
import NRRDViewer from "@metacell/geppetto-meta-ui/nrrd-viewer/NRRDViewer";

const example1 = "https://v2.virtualflybrain.org/data/VFB/i/0010/12vj/VFB_00101567/volume.nrrd";
const example2 = "https://v2.virtualflybrain.org/data/VFB/i/0010/1567/VFB_00101567/volume.nrrd";
const example3 = "https://v2.virtualflybrain.org/data/VFB/i/0010/101b/VFB_00101567/volume.nrrd";


export default class NRRDViewerShowcase extends Component {
  constructor (props) {
    super(props);
  }

  render () {
    const examples = [example1, example2, example3];

    return (
      <NRRDViewer nrrdUrls={examples} skipOnMount={true} />
    );
  }
}