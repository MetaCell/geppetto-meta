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
    const examples = [
      { id: 'example1' , url: example1 },  
      { id: 'example2', url: example2 }, 
      { id: 'example3', url: example3 }
    ];

    return (
      <NRRDViewer files={examples} skipOnMount={true} />
    );
  }
}