import React, { Component } from 'react'
import * as WidgetCapability from "../../widgets/WidgetCapability";
import ConnectivityComponent from "./ConnectivityComponent";
import { Matrix} from "./layouts/Matrix";


export default class ConnectivityWrapper extends Component {
  constructor (props) {
    super(props);
    this.width = 600;
    this.height = 500;
    this.state = {
      data: [],
      isOpen: false
    }
  }

  handleClick (data){
    this.setState({ data: data, isOpen: true })
  }


  render () {
    const ConnectivityWidget = WidgetCapability.createWidget(ConnectivityComponent);
    const isOpen = this.state.isOpen;
    const data = this.state.data;
    const auxFunctions = {
      linkType: "("
          + "function (c){return GEPPETTO.ModelFactory.getAllVariablesOfType(c.getParent(),GEPPETTO.ModelFactory.geppettoModel.neuroml.synapse)[0].getId();}"
    + ")"
    };
    const colorScale = null;
    let show;
    if (!isOpen){
      show = <button onClick={() => this.handleClick(Window.workaround)}>Activate Connectivity </button>
    } else {
      show = <ConnectivityWidget
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
        data={data}
        auxFunctions={auxFunctions}
        colorScale={colorScale}
        layout={new Matrix()}
      />
    }
    return (
      show
    )
  }
}

