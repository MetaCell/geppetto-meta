import React, { Component } from 'react'
import ConnectivityComponent from "./ConnectivityComponent";
import { Matrix } from "./layouts/Matrix";


export default class ConnectivityWrapper extends Component {
  constructor (props) {
    super(props);
    this.width = 700;
    this.height = 600;
    this.state = {
      data: [],
      isOpen: false
    }
  }

  handleClick (data){
    this.setState({ data: data, isOpen: true })
  }


  render () {
    const isOpen = this.state.isOpen;
    const data = this.state.data.root;
    const auxFunctions = this.state.data.options;
    const nodeColormap = this.state.data.nodeColormap;
    let show;
    if (!isOpen){
      show = <button onClick={() => this.handleClick(Window.workaround)}>Activate Connectivity </button>
    } else {
      show = <ConnectivityComponent
        id="ConnectivityContainer"
        size={{ height: this.height, width: this.width }}
        data={data}
        auxFunctions={auxFunctions}
        nodeColormap={nodeColormap}
        layout={new Matrix()}
      />
    }
    return (
      show
    )
  }
}

