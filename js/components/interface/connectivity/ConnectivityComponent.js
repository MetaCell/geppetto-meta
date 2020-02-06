import React from 'react';
import AbstractComponent from '../../AComponent';
import ConnectivityDeck from "./subcomponents/ConnectivityDeck";
import { Matrix } from "./layouts/Matrix";
import * as util from "./utilities";
import Instance from '../../../geppettoModel/model/Instance';
const d3 = require("d3");
import { withStyles } from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import MenuButton from "./subcomponents/MenuButton";
import IconText from "./subcomponents/IconText";
import Typography from '@material-ui/core/Typography';
import IconButtonWithTooltip from "./subcomponents/IconButtonWithTooltip";


const styles = {
  container: {
    height: '100%',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column' 
  },
  connectivityContainer: {
    background: '#424242',
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    flex: "1"
  },
  legendTitle: {
    fontSize: "14px",
    color: "white",
  },
  toolbarBox: {
    border: "solid #303030",
    borderRadius: "5px",
  },
  gridWrapper:{
    display:"grid",
    gridTemplateColumns:"82% 18%" 
  },
  button: {
    padding: "8px",
    top: "0",
    color: "#fc6320"
  },

};

class ConnectivityComponent extends AbstractComponent {
  constructor (props) {
    super(props);
    this.state = {
      layout: this.props.layout !== null ? this.props.layout : new Matrix(),
      buttonVisibility: false,
      legendsVisibility: true,
    };
    this.defaultOptions = {
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


    this.deckHandler = this.deckHandler.bind(this);
    this.sortOptionsHandler = this.sortOptionsHandler.bind(this);
    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);
  }

  componentDidMount () {
    this.setOptions(this.props.options);
    this.setData(this.props.data);
    this.setNodeColormap(this.props.colorMap);
    this.draw();
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.options !== this.props.options){
      this.setOptions(this.props.options);
    }
    this.setData(this.props.data);
    this.setNodeColormap(this.props.colorMap);
    this.draw();
  }

  /**
   *
   * Sets connectivity auxiliary functions
   *
   * @command setOptions(options)
   * @param {Object} options - options to modify the connections
   */


  setOptions (options){
    this.options = this.defaultOptions;
    if (options != null) {
      this.options = util.extend(this.options, options);

      if (typeof this.options.linkType === 'string') {
        this.options.linkType = util.strToFunc(this.options.linkType);
      }
      if (typeof this.options.nodeType === 'string') {
        this.options.nodeType = util.strToFunc(this.options.nodeType);
      }
      if (typeof this.options.linkWeight === 'string') {
        this.options.linkWeight = util.strToFunc(this.options.linkWeight);
      }
      if (typeof this.options.colorMapFunction === 'string') {
        this.options.colorMapFunction = util.strToFunc(this.options.colorMapFunction);
      }
      if (typeof this.options.library === 'string') {
        this.options.library = eval(this.options.library);
      }
    }
  }

  /**
   *
   * Creates dataset with provided data
   *
   * @command setData(data)
   *
   * @param data
   */
  setData (data){
    this.dataset = {};
    this.mapping = {};
    this.mappingSize = 0;
    this.dataset["root"] = data;
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
    const domain = this.props.names;
    const range = this.props.colors;
    return d3.scaleOrdinal(range).domain(domain);
  }
  
  /**
   *
   * Creates connections and draws layout
   *
   * @command draw()
   *
   */
  draw (){
    if (this.createDataFromConnections()){
      this.drawLayout();
    }
  }

  /**
   *
   * Creates data from connections
   *
   * @command createDataFromConnections()
   */
  createDataFromConnections (){
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
          this.createLink(sourceId, targetId, this.options.linkType.bind(this)(connectionVariable, this.linkCache), this.options.linkWeight(connectionVariable));
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
   * Draws the layout
   *
   * @command drawLayout()
   *
   */
  drawLayout () {
    this.svgHeight = this.props.size.height;
    this.svgWidth = this.props.size.width;
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
    d3.select("svg").remove();
  }

  /**
   *
   * Handle layout selection
   *
   * @command deckHandler (layout)
   *
   * @param layout
   */
  deckHandler (layout) {
    this.setState(() => ({ layout: layout }), () => {
      this.setOptions(this.props.options);
    });
  }

  /**
   *
   * Handle legend collapse button
   *
   * @command legendHandler (layout)
   *
   */
  legendHandler () {
    this.setState(() => ({ legendsVisibility: !this.state.legendsVisibility }));
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

  /**
   *
   * Updates the sorting order
   *
   * @command sortOptionsHandler (option)
   *
   */
  sortOptionsHandler (option){
    this.state.layout.setOrder(this, option);
  }


  render () {
    const { id, classes } = this.props;
    const { layout, buttonVisibility, legendsVisibility } = this.state;
    const sortOptions = {
      'id': 'By entity name',
      'pre_count': 'By # pre',
      'post_count': 'By # post'
    };
    const visibility = buttonVisibility ? "visible" : "hidden";
    
    let selectButton;
    if (layout instanceof Matrix){
      selectButton = (<MenuButton id={id + 'select'}
        options={sortOptions}
        handler = {this.sortOptionsHandler}
        defaultOption = "id"
        tooltip={"Order by"}
      />)
    }

    let legends = [];
    if (this.state.layout && this.nodeColormap){
      const layoutLegends = this.state.layout.getLegends(this);
      for (const obj of layoutLegends){
        if (obj.title){
          legends.push(
            <Typography key={obj.title} className={classes.legendTitle} variant="h6" gutterBottom>
              {obj.title}
            </Typography>
          )
        }
        let domain = obj.colorScale.domain().slice().sort();
        for (const [i,v] of domain.entries()) {
          legends.push(
            <IconText key={v} icon="fa fa-square-full legend-item" color={obj.colorScale(i)} subtitle={v}
              width={"20px"} height={"20px"}
            />
          );
        }
      }
    }

    let legendsButton = legendsVisibility ? "fa fa-chevron-down" : "fa fa-chevron-up";
    let legendsTooltip = legendsVisibility ? "Collapse subtitles" : "Open subtitles";

    return (
      <div className={classes.container} onMouseEnter={this.onEnter} onMouseLeave={this.onLeave}>
        <div className={classes.connectivityContainer}>
          <Toolbar>
            <div className={classes.toolbarBox + " visibility: " + visibility }>
              <ConnectivityDeck ref={ deck => {
                this.deck = deck
              } } handler={this.deckHandler}/>
              {selectButton}
              <IconButtonWithTooltip
                disabled={false}
                onClick={() => this.setState({ legendsVisibility: !legendsVisibility })}
                className={ legendsButton + ` ${classes.button} `}
                tooltip={legendsTooltip}
              />
            </div>
          </Toolbar>
          <div className={classes.gridWrapper}>
            <div id={id}/>
            <div>
              {legendsVisibility ? (legends.map(entry => (
                entry
              ))) : ""}
            </div>
          </div>
        </div>
      </div>

    )
  }
}
export default withStyles(styles)(ConnectivityComponent);