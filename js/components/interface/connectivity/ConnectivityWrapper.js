import React, { Component } from 'react'
import * as WidgetCapability from "../../widgets/WidgetCapability";
import ConnectivityComponent from "./ConnectivityComponent";


export default class ConnectivityWrapper extends Component {
  constructor (props) {
    super(props);
    this.width = 600;
    this.height = 500;
  }
  
  render () {
    const ConnectivityWidget = WidgetCapability.createWidget(ConnectivityComponent);
    return (
      <ConnectivityWidget
        id="ConnectivityContainer"
        name={"Connectivity"}
        componentType={'connectivity'}
        size={{ height: this.height, width: this.width }}
        showDownloadButton={false}
        resizable={true}
        draggable={true}
        help={false}
        fixPosition={false}
        showHistoryIcon={true}
        closable={true}
        minimizable={true}
        collapsable={true}
        layout="matrix"
      />
    )
  }
}

