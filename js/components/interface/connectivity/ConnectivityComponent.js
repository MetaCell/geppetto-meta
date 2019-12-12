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
    this.connectivityContainer = this.selectElement(this.props.id);
    this.innerHeight = this.getInnerHeight(this.connectivityContainer) - this.widgetMargin;
    this.innerWidth = this.getInnerWidth(this.connectivityContainer) - this.widgetMargin;
  }

  componentWillUpdate (prevProps, prevState, snapshot) {
    console.log("HERE");
    console.log(Window.workaround)
  }

  createLayout () {
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

  //
  // createElement(type, options){
  //   let el = document.createElement(type)
  //   for
  // }
  //
  // append(dest, element){
  //   dest.appendChild(element);
  // }
  //
  // appendTo (dest, element){
  //
  // }

  extend (obj1, obj2){
    Object.assign(obj1, obj2);
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

  setData (data){
    this.setOptions(data.options);
    this.dataset = {};
    this.mapping = {};
    this.mappingSize = 0;
    this.dataset["root"] = data.root;
    this.setNodeColormap(data.nodeColormap);
    if (this.createDataFromConnections()){
      this.createLayout();
    }
  }

  setOptions (options){
    function strToFunc (body){
      return new Function('x', 'return ' + body + ';');
    }
    if (options != null) {
      if (typeof options.linkType === 'string') {
        options.linkType = strToFunc(options.linkType);
      }
      if (typeof options.nodeType === 'string') {
        options.nodeType = strToFunc(options.nodeType);
      }
      if (typeof options.linkWeight === 'string') {
        options.linkWeight = strToFunc(options.linkWeight);
      }
      if (typeof options.colorMapFunction === 'string') {
        options.colorMapFunction = strToFunc(options.colorMapFunction);
      }
      if (typeof options.library === 'string') {
        options.library = eval(options.library);
      }
      this.extend(this.options, options);
    }
  }

  setNodeColormap (nodeColormap) {
    if (typeof nodeColormap !== 'undefined') {
      this.nodeColormap = nodeColormap;
    } else {
      this.nodeColormap = this.defaultColorMapFunction();
    }
    return this.nodeColormap;
  }

  defaultColorMapFunction () {
    const cells = this.dataset["root"].getChildren();
    const domain = [];
    const range = [];
    for (let i = 0; i < cells.length; ++i) {
      if (cells[i].getMetaType() === GEPPETTO.Resources.ARRAY_INSTANCE_NODE) {
        domain.push(cells[i].getName());
        range.push(cells[i].getColor());
      }
    }
    // if everything is default color, use a d3 provided palette as range
    if (range.filter(function (x) {
      return x !== GEPPETTO.Resources.COLORS.DEFAULT;
    }).length === 0) {
      return d3.scaleOrdinal(d3.schemeCategory20).domain(domain);
    } else {
      return d3.scaleOrdinal(range).domain(domain);
    }
  }

  createDataFromConnections () {
    const connectionVariables = GEPPETTO.ModelFactory.getAllTypesOfType(this.options.library.connection)[0].getVariableReferences();
    if (connectionVariables.length > 0) {
      if (this.dataset["root"].getMetaType() === GEPPETTO.Resources.INSTANCE_NODE) {
        const subInstances = this.dataset["root"].getChildren();
        this.dataset["nodes"] = [];
        this.dataset["links"] = [];
        for (let k = 0; k < subInstances.length; k++) {
          const subInstance = subInstances[k];
          if (subInstance.getMetaType() === GEPPETTO.Resources.ARRAY_INSTANCE_NODE) {
            const populationChildren = subInstance.getChildren();
            for (let l = 0; l < populationChildren.length; l++) {
              let populationChild = populationChildren[l];
              this.createNode(populationChild.getId(), this.options.nodeType(populationChild));
            }
          }
        }
        for (let x = 0; x < connectionVariables.length; x++){
          const connectionVariable = connectionVariables[x];
          let source = connectionVariable.getA();
          let target = connectionVariable.getB();
          let sourceId = source.getElements()[source.getElements().length - 1].getPath();
          let targetId = target.getElements()[source.getElements().length - 1].getPath();
          this.createLink(sourceId, targetId, this.options.linkType.bind(this)(connectionVariable, this.linkCache), this.options.linkWeight(connectionVariable));
        }
      }
      this.dataset.nodeTypes = _.uniq(_.pluck(this.dataset.nodes, 'type')).sort();
      this.dataset.linkTypes = _.uniq(_.pluck(this.dataset.links, 'type')).sort();
      return true;
    }
    return false;
  }

  render () {
    const { id } = this.props;
    return (
      <div>
        <ConnectivityDeck/>
        <div id={id}>
          <button onClick={() => this.setData(Window.workaround)}>
            Activate Lasers
          </button>
        </div>
      </div>

    )
  }
}