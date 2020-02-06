import React, { Component } from 'react'
import ConnectivityComponent from "./ConnectivityComponent";
import { Matrix } from "./layouts/Matrix";
const d3 = require("d3");

export default class ConnectivityWrapper extends Component {
  constructor (props) {
    super(props);

    this.sizes = [{ width: 660, height: 600 }, { width: 1000, height: 700 }, ];
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
      ctx.getCellsData();
      ctx.forceUpdate()
    }
  }

  getCellsData () {
    const cells = this.state.data.root.getChildren();
    this.colors = [];
    this.names = [];
    for (let i = 0; i < cells.length; ++i) {
      if (cells[i].getMetaType() === GEPPETTO.Resources.ARRAY_INSTANCE_NODE) {
        this.names.push(cells[i].getName());
        this.colors.push(cells[i].getColor());
      }
    }
    if (this.colors.filter(function (x) {
      return x !== GEPPETTO.Resources.COLORS.DEFAULT;
    }).length === 0) {
      this.colors = d3.schemeCategory20
    }
  }

  render () {
    const data = this.state.data.root;
    const options = this.state.data.options;
    const colorMap = this.state.data.nodeColormap;
    const { width, height, isOpen } = this.state;
    let colors = [];
    let names = [];
    if (isOpen){
      this.getCellsData();
      colors = this.colors;
      names = this.names;
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
          names={names}
          layout={new Matrix()}
        />
        <br/>
        <button onClick={() => this.handleDimensions()}> Resize </button>
      </div>
    }

    return (
      <div style={{ maxWidth: width, maxHeight: height, marginLeft:"100px" }}>
        {show}
      </div>

    )
  }
}

