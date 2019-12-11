import React from 'react';
import AbstractComponent from '../../AComponent';
import ConnectivityDeck from "./subcomponents/ConnectivityDeck";
import { Matrix } from "./layouts/Matrix";
import * as d3 from "d3";

export default class ConnectivityComponent extends AbstractComponent {
  constructor (props) {
    super(props);
    this.layout = this.props.layout !== null ? this.props.layout : "matrix";
    this.size = this.props.size;
    this.widgetMargin = 20;
  }

  componentDidMount () {
    this.connectivityContainer = this.selectElement(this.id);
    this.innerHeight = this.getInnerHeight(this.connectivityContainer) - this.widgetMargin;
    this.innerWidth = this.getInnerWidth(this.connectivityContainer) - this.widgetMargin;
    this.drawLayout();
  }

  drawLayout () {
    this.cleanCanvas();
    this.svg = d3.select(this.props.id)
      .append("svg")
      .attr("width", this.innerWidth)
      .attr("height", this.innerHeight);
    const layout = this.getLayout(this);
    layout.draw()
  }

  cleanCanvas (){
    this.removeElement(this.props.id);
    this.removeElement("#" + "matrix-sorter");
  }

  getInnerWidth (el){
    return parseFloat(getComputedStyle(el, null).width.replace("px", ""))
  }

  getInnerHeight (el){
    return parseFloat(getComputedStyle(el, null).height.replace("px", ""))
  }
  selectElement (cssSelector){
    return document.getElementById(cssSelector);
  }
  removeElement (cssSelector){
    const container = document.querySelectorAll(cssSelector);

    for (let i = 0; i < container.length; i++) {
      let element = container[i];
      if (element.innerHTML.length === 0) {
        element.parentNode.removeChild(element);
      }
    }
  }

  getLayout (svgCanvas) {
    let layout = this.props.layout !== null ? this.props.layout : "matrix";
    switch (layout) {
    case "matrix":
      return new Matrix(svgCanvas);
    case "force":
      return;
    case "hive":
      return;
    case "chord":
      return;
    }
  }

  render () {
    const { id } = this.props;
    return (
      <div>
        <ConnectivityDeck/>
        <div id={id}/>
      </div>

    )
  }
}