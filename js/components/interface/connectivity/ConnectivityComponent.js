import React from 'react';
import AbstractComponent from '../../AComponent';
import ConnectivityDeck from "./subcomponents/ConnectivityDeck";
import { Matrix } from "./layouts/Matrix";
import * as d3 from "d3";
import * as util from "./utilities";
import Instance from '../../../geppettoModel/model/Instance';

export default class ConnectivityComponent extends AbstractComponent {
  constructor (props) {
    super(props);
    this.state = {
      layout: this.props.layout !== null ? this.props.layout : new Matrix(),
      size: this.props.size,
      width: 660,
      height: 500,
      widgetMargin: 20
    };
    this.auxFunctions = {
      nodeType: function (node) {
        if (node instanceof Instance) {
          return node.getParent().getId();
        } else {
          return node.getPath().split('_')[0];
        }
      },
      linkWeight: function (conn) {
        return 1;
      },
      linkType: function (conn) {
        return 1;
      },
      library: "GEPPETTO.ModelFactory.geppettoModel.common"
    };

    this.setAuxFunctions(this.props.auxFunctions);
    this.setData(this.props.data);
  }

  /**
   *
   * Sets auxiliary functions
   *
   * @command setAuxFunctions(auxFunctions)
   * @param {Object} auxFunctions - auxFunctions to modify the plot widget
   */
  setAuxFunctions (auxFunctions){
    if (auxFunctions != null) {
      if (typeof auxFunctions.linkType === 'string') {
        auxFunctions.linkType = util.strToFunc(auxFunctions.linkType);
      }
      if (typeof auxFunctions.nodeType === 'string') {
        auxFunctions.nodeType = util.strToFunc(auxFunctions.nodeType);
      }
      if (typeof auxFunctions.linkWeight === 'string') {
        auxFunctions.linkWeight = util.strToFunc(auxFunctions.linkWeight);
      }
      if (typeof auxFunctions.colorMapFunction === 'string') {
        auxFunctions.colorMapFunction = util.strToFunc(auxFunctions.colorMapFunction);
      }
      if (typeof auxFunctions.library === 'string') {
        auxFunctions.library = eval(auxFunctions.library);
      }
      util.extend(this.auxFunctions, auxFunctions);
    }
  }

  /**
   *
   * Sets data and draws layout
   *
   * @command setData(root)
   * @param root
   */
  setData (root){
    this.dataset = {};
    this.mapping = {};
    this.mappingSize = 0;
    this.dataset["root"] = root;
    this.setColorScale(this.props.colorScale);
    if (this.createDataFromConnections()){
      this.createLayout();
    }
    GEPPETTO.on(GEPPETTO.Events.Color_set, this.onColorChange(this));
  }

  /**
   *
   * Creates data from connections
   *
   * @command createDataFromConnections()
   */
  createDataFromConnections (){
    const connectionVariables = GEPPETTO.ModelFactory.getAllTypesOfType(this.auxFunctions.library.connection)[0].getVariableReferences();
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
              const populationChild = populationChildren[l];
              this.createNode(populationChild.getId(), this.options.nodeType(populationChild));
            }
          }
        }
        for (let x = 0; x < connectionVariables.length; x++){
          const connectionVariable = connectionVariables[x];
          const source = connectionVariable.getA();
          const target = connectionVariable.getB();
          const sourceId = source.getElements()[source.getElements().length - 1].getPath();
          const targetId = target.getElements()[source.getElements().length - 1].getPath();
          this.createLink(sourceId, targetId, this.auxFunctions.linkType.bind(this)(connectionVariable, this.linkCache), this.auxFunctions.linkWeight(connectionVariable));
        }
      }
      this.dataset.nodeTypes = util.uniq(util.pluck(this.dataset.nodes, 'type')).sort();
      this.dataset.linkTypes = util.uniq(util.pluck(this.dataset.links, 'type')).sort();
      return true;
    }
    return false;
  }

  /**
   *
   * Creates node
   *
   * @command createNode(id, type)
   *
   * @param id
   * @param type
   */
  createNode (id, type) {
    if (!(id in this.mapping)) {
      const nodeItem = {
        id: id,
        type: type,
      };
      this.dataset["nodes"].push(nodeItem);
      this.mapping[nodeItem["id"]] = this.mappingSize;
      this.mappingSize++;
    }
  }

  /**
   *
   * Creates link
   *
   * @command createLink(sourceId, targetId, type, weight)
   *
   * @param sourceId
   * @param targetId
   * @param type
   * @param weight
   */
  createLink (sourceId, targetId, type, weight) {
    const linkItem = {
      source: this.mapping[sourceId],
      target: this.mapping[targetId],
      type: type,
      weight: weight
    };
    this.dataset["links"].push(linkItem);
  }

  /**
   *
   * Sets colorScale
   *
   * @command setColorScale(colorScale)
   *
   * @param colorScale
   */
  setColorScale (colorScale){
    if (typeof colorScale !== 'undefined') {
      this.nodeColormap = colorScale;
    } else {
      this.nodeColormap = this.defaultColorMapFunction();
    }
  }

  /**
   *
   * Returns default colorScale
   *
   * @command defaultColorMapFunction()
   *
   */
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

  componentDidMount () {
    this.connectivityContainer = this.selectElement(this.props.id);
    this.innerHeight = util.getInnerHeight(this.connectivityContainer) - this.state.widgetMargin;
    this.innerWidth = util.getInnerWidth(this.connectivityContainer) - this.state.widgetMargin;
  }

  createLayout () {
    this.cleanCanvas();
    this.svg = d3.select(this.props.id)
      .append("svg")
      .attr("width", this.innerWidth)
      .attr("height", this.innerHeight);
    this.layout.draw(this)
  }

  cleanCanvas (){
    this.removeElement(this.props.id);
    this.removeElement("#" + "matrix-sorter");
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