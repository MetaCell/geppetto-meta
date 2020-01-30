import React, { Component } from 'react'
import ConnectivityComponent from "./ConnectivityComponent";
import { Matrix } from "./layouts/Matrix";


export default class ConnectivityWrapper extends Component {
  constructor (props) {
    super(props);

    this.state = {
      data: [],
      isOpen: false,
      width: 660,
      height: 500,
      showResize: true,
    }
  }

  handleClick (data){
    this.setState({ data: data, isOpen: true })
  }

  handleDimensions (){
    this.setState({ width: 1600, height: 800, showResize: false })
  }

  onColorChange (ctx){
    return function (){
      ctx.getColors();
      ctx.forceUpdate()
    }
  }

  getColors () {
    const cells = this.state.data.root.getChildren();
    this.colors = [];
    for (let i = 0; i < cells.length; ++i) {
      if (cells[i].getMetaType() === GEPPETTO.Resources.ARRAY_INSTANCE_NODE) {
        this.colors.push(cells[i].getColor());
      }
    }
  }

  render () {
    const data = this.state.data.root;
    const options = this.state.data.options;
    const colorMap = this.state.data.nodeColormap;
    const { width, height, isOpen, showResize } = this.state;
    let colors = [];
    if (isOpen){
      this.getColors();
      colors = this.colors;
      GEPPETTO.on(GEPPETTO.Events.Color_set, this.onColorChange(this));
    }

    let show;
    let connectivityComponent = <ConnectivityComponent
      id="ConnectivityContainer"
      size={{ height: height, width: width }}
      data={data}
      options={options}
      colorMap={colorMap}
      colors={colors}
      layout={new Matrix()}
    />;
    if (!isOpen){
      show = <button onClick={() => this.handleClick(Window.workaround)}>Activate Connectivity </button>
    } else {
      if (showResize){
        show = <div>
          {connectivityComponent}
          <br/>
          <button onClick={() => this.handleDimensions()}> Resize </button>
        </div>
      } else {
        show = { connectivityComponent }
      }
    }
    
    return (
      show
    )
  }
}

