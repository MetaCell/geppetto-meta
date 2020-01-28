import React from 'react';
import AbstractComponent from '../../AComponent';
import ConnectivityDeck from "./subcomponents/ConnectivityDeck";
import { Matrix } from "./layouts/Matrix";
import * as util from "./utilities";
import Instance from '../../../geppettoModel/model/Instance';
const d3 = require("d3");
import { withStyles } from '@material-ui/core';


const styles = { root: { background: '#424242', }, };

class ConnectivityComponent extends AbstractComponent {
  constructor (props) {
    super(props);
    this.state = {
      layout: this.props.layout !== null ? this.props.layout : new Matrix(),
      containerMargin: 20,
      buttonVisibility: true
    };
    this.defaultAuxFunctions = {
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
    this.auxFunctions = this.defaultAuxFunctions;
    this.setAuxFunctions(this.props.auxFunctions);
    this.configViaGUI = this.configViaGUI.bind(this);
    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);
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
      this.auxFunctions = util.extend(this.auxFunctions, auxFunctions);

      if (typeof this.auxFunctions.linkType === 'string') {
        this.auxFunctions.linkType = util.strToFunc(this.auxFunctions.linkType);
      }
      if (typeof this.auxFunctions.nodeType === 'string') {
        this.auxFunctions.nodeType = util.strToFunc(this.auxFunctions.nodeType);
      }
      if (typeof this.auxFunctions.linkWeight === 'string') {
        this.auxFunctions.linkWeight = util.strToFunc(this.auxFunctions.linkWeight);
      }
      if (typeof this.auxFunctions.colorMapFunction === 'string') {
        this.auxFunctions.colorMapFunction = util.strToFunc(this.auxFunctions.colorMapFunction);
      }
      if (typeof this.auxFunctions.library === 'string') {
        this.auxFunctions.library = eval(this.auxFunctions.library);
      }
    }
  }

  componentDidMount () {
    util.addEventListenerClass("ui-dialog-titlebar-maximize", 'click', () => this.createLayout.bind(this));
    util.addEventListenerClass("ui-dialog-titlebar-restore", 'click', () => this.createLayout.bind(this));
    util.addEventListenerId(this.props.id, 'dialog_container_resize', () => this.createLayout.bind(this));
    this.setData(this.props.data);
  }

  /**
   *
   * Sets data and draws layout
   *
   * @command setData(data)
   * @param data
   */
  setData (data){
    this.dataset = {};
    this.mapping = {};
    this.mappingSize = 0;
    this.dataset["root"] = data;
    this.setNodeColormap(this.props.nodeColormap);
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
              this.createNode(populationChild.getId(), this.auxFunctions.nodeType(populationChild));
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
   * Prepocesses node degrees
   *
   * @command calculateNodeDegrees(normalize)
   * @param normalize
   */
  calculateNodeDegrees (normalize) {
    const indegrees = util.countBy(this.dataset.links, function (link) {
      return link.source;
    });

    const outdegrees = util.countBy(this.dataset.links, function (link) {
      return link.target;
    });
    let maxDeg = 1;
    this.dataset.nodes.forEach(function (node, idx) {
      const idg = (typeof indegrees[idx] === 'undefined') ? 0 : indegrees[idx];
      const odg = (typeof outdegrees[idx] === 'undefined') ? 0 : outdegrees[idx];
      node.degree = idg + odg;
      if (node.degree > maxDeg) {
        maxDeg = node.degree;
      }
    });
    if (normalize) {
      this.dataset.nodes.forEach(function (node) {
        node.degree /= maxDeg;
      });
    }
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
   * Sets nodeColormap
   *
   * @command setNodeColormap(nodeColormap)
   *
   * @param nodeColormap
   */
  setNodeColormap (nodeColormap){
    if (typeof nodeColormap !== 'undefined') {
      this.nodeColormap = nodeColormap;
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

  /**
   *
   * Sets colorScale
   *
   * @command onColorChange(context)
   *
   * @param context
   */

  onColorChange (context){
    return function (){
      const colorMap = context.auxFunctions.colorMapFunction ? context.auxFunctions.colorMapFunction() : context.defaultColorMapFunction();
      for (let i = 0; i < colorMap.domain().length; ++i) {
        // only update if there is a change
        if (context.nodeColormap(colorMap.domain()[i]) !== colorMap(colorMap.domain()[i])) {
          context.setNodeColormap(colorMap);
          /*
           * FIXME: would be more efficient to update only what has
           * changed, though this depends on the type of layout
           */
          context.svg.selectAll("*").remove();
          context.createLayout();
          break;
        }
      }
    }
  }

  /**
   *
   * Creates the layout
   *
   * @command createLayout()
   *
   */

  createLayout () {
    this.svgHeight = this.props.size.height - this.state.containerMargin;
    this.svgWidth = this.props.size.width - this.state.containerMargin;
    this.connectivityContainer = util.selectElement("#" + this.props.id);
    this.cleanCanvas();
    this.svg = d3.select("#" + this.props.id)
      .append("svg")
      .attr("width", this.svgWidth)
      .attr("height", this.svgHeight);
    this.state.layout.draw(this)
  }

  /**
   *
   * Cleans the canvas
   *
   * @command cleanCanvas()
   *
   */

  cleanCanvas (){
    util.removeElement("#" + this.props.id + " svg");
    util.removeElement("#" + this.props.id + " #matrix-sorter");
  }


  /**
   *
   * Creates legend
   *
   * @command createLegend (id, colorScale, position, title)
   *
   * @param id
   * @param colorScale
   * @param position
   * @param title
   */
  createLegend (id, colorScale, position, title) {

    let ret;
    // TODO: boxes should scale based on number of items
    const colorBox = { size: 20, labelSpace: 4 };
    const padding = { x: colorBox.size, y: 2 * colorBox.size };

    // TODO: is it sane not to draw the legend if there is only one category?
    if (colorScale.domain().length > 1) {
      let horz, vert;
      const legendItem = this.svg.selectAll(id)
        .data(colorScale.domain().slice().sort())
        .enter().append('g')
        .attr('class', 'legend-item')
        .attr('transform', function (d, i) {
          const height = colorBox.size + colorBox.labelSpace;
          horz = colorBox.size + position.x + padding.x - 5;
          vert = i * height + position.y + padding.y;
          return 'translate(' + horz + ',' + vert + ')';
        });

      // coloured squares
      legendItem.append('rect')
        .attr('width', colorBox.size)
        .attr('height', colorBox.size)
        .style('fill', function (d) {
          return colorScale(d);
        })
        .style('stroke', function (d) {
          return colorScale(d);
        });

      // labels
      legendItem.append('text')
        .attr('x', colorBox.size + colorBox.labelSpace)
        .attr('y', colorBox.size - colorBox.labelSpace)
        .attr('class', 'legend-text')
        .text(function (d) {
          return d;
        });

      // title
      if (typeof title != 'undefined') {
        this.svg.append('text')
          .text(title)
          .attr('class', 'legend-title')
          .attr('x', position.x + 2 * padding.x)
          .attr('y', position.y + 0.75 * padding.y);
      }
      ret = { x: horz, y: vert };
    }

    return ret;
  }

  /**
   *
   * Handle layout selection
   *
   * @command configViaGUI (layout)
   *
   * @param layout
   */
  configViaGUI (layout) {
    this.setState(() => ({ layout: layout }), () => {
      this.auxFunctions = this.defaultAuxFunctions;
      this.setAuxFunctions(this.props.auxFunctions);
      this.setData(this.dataset["root"]);
    });
  }

  /**
   *
   * Updates buttonVisibility true
   *
   * @command onHover (layout)
   *
   */
  onEnter (){
    this.setState({ buttonVisibility: true });
  }

  /**
   *
   * Updates buttonVisibility false
   *
   * @command onLeave (layout)
   *
   */
  onLeave (){
    this.setState({ buttonVisibility: false });
  }


  render () {
    const { id, classes } = this.props;
    return (
      <div className={classes.root} style={{ maxWidth: this.props.size.width, maxHeight: this.props.size.height }}>
        <ConnectivityDeck handler={this.configViaGUI} buttonVisibility={this.state.buttonVisibility}/>
        <div id={id}/>
      </div>

    )
  }
}
export default withStyles(styles)(ConnectivityComponent);