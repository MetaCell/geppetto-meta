import React, { Component } from "react"
import HTMLViewer from "../../HTMLViewer"

export default class HTMLViewerShowcase extends Component {
  constructor(props) {
    super(props);
    this.htmlContent = "<img style=\"height: " + eval(window.outerHeight) + "px; width: 98%; margin: auto; display: block; padding-top: 25px\" src=\"https://upload.wikimedia.org/wikipedia/en/7/7c/Geppetto_1940_Pinocchio.jpeg\" />"
  }

  render() {
    return (
      <HTMLViewer
        id="ButtonBarComponentViewerContainer"
        content={this.htmlContent}
        style={{
          width: '100%',
          height: '100%',
          float: 'center'
        }}
        />
    );
  }
}