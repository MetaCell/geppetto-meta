import React, { Component } from 'react'
import ConnectivityComponent from "./ConnectivityComponent";
import { Matrix } from "./layouts/Matrix";


export default class ConnectivityWrapper extends Component {
  constructor (props) {
    super(props);

    this.sizes = [{ width: 660, height: 500 }, { width: 1200, height: 900 }];
    this.state = {
      data: [],
      isOpen: false,
      resize: false,
      width: this.sizes[0].width,
      height: this.sizes[0].height,
    }
  }

  handleClick (data){
    this.setState({ data: data, isOpen: true })
  }

  handleDimensions (){
    const resize = !this.state.resize;
    const index = resize | 0;
    this.setState({ width: this.sizes[index].width, height: this.sizes[index].height, resize: !this.state.resize })
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
    const { width, height, isOpen } = this.state;
    let colors = [];
    if (isOpen){
      this.getColors();
      colors = this.colors;
      GEPPETTO.on(GEPPETTO.Events.Color_set, this.onColorChange(this));
    }

    let show;
    if (!isOpen){
      show = <button onClick={() => this.handleClick(Window.workaround)}>Activate Connectivity </button>
    } else {
      show = <div>
        <ConnectivityComponent
          id="ConnectivityContainer"
          size={{ height: height, width: width }}
          data={data}
          options={options}
          colorMap={colorMap}
          colors={colors}
          layout={new Matrix()}
        />
        <br/>
        <button onClick={() => this.handleDimensions()}> Resize </button>
      </div>
    }

    return (
      <div style={{ maxWidth: width, maxHeight: height }}>
        {show}
      </div>

    )
  }
}

