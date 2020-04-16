import React, { Component } from "react";
import model from '../model.json';
import Tree from "../../Tree"
import {
  createMuiTheme,
  MuiThemeProvider
} from "@material-ui/core/styles";
import Tooltip from '@material-ui/core/Tooltip';
const treeCypherQuery = require('../TreeConfiguration').treeCypherQuery;
const restPostConfig = require('../TreeConfiguration').restPostConfig;


export default class TreeShowcase extends Component {
  constructor(props) {
    super(props);
    GEPPETTO.Manager.loadModel(model);
    this.nodeClick = this.nodeClick.bind(this);
    this.getNodes = this.getNodes.bind(this);
    this.getButtons = this.getButtons.bind(this);
    this.restPost = this.restPost.bind(this);
    this.convertDataForTree = this.convertDataForTree.bind(this);
    this.insertChildren = this.insertChildren.bind(this);
    this.findChildren = this.findChildren.bind(this);
    this.findRoot = require('../helper').findRoot;
    this.buildDictClassToIndividual = require('../helper').buildDictClassToIndividual;
    this.parseGraphResultData = require('../helper').parseGraphResultData;
    this.searchChildren = require('../helper').searchChildren;
    this.sortData = require('../helper').sortData;
    this.defaultComparator = require('../helper').defaultComparator;

    this.AUTHORIZATION = "Basic " + btoa("neo4j:vfb");
    this.theme = createMuiTheme({ overrides: { MuiTooltip: { tooltip: { fontSize: "12px" } } } });
  }

  restPost(data) {
    const strData = JSON.stringify(data);
    const options = {
      method: "POST",
      headers: new Headers({ 'content-type': restPostConfig.contentType }),
      body: strData,
      mode: 'no-cors'
    }
    if (this.AUTHORIZATION != undefined) {
      options["Authorization"] = this.AUTHORIZATION;
    }
    return fetch(restPostConfig.url, options)
  }

  nodeClick(event, rowInfo) {
    if (event.target.getAttribute("type") !== "button" && (event.target.getAttribute("aria-label") !== "Collapse" || event.target.getAttribute("aria-label") !== "Expand")) {
      console.log(rowInfo.node);
    }
  }
  convertDataForTree (nodes, edges, vertix, imagesMap) {
    // This will create the data structure for the react-sortable-tree library, starting from the vertix node.
    let refinedDataTree = [];
    for ( let i = 0; i < nodes.length; i++ ) {
      if (vertix === nodes[i].id) {
        refinedDataTree.push({
          title: nodes[i].title,
          subtitle: nodes[i].classId,
          description: nodes[i].info,
          classId: nodes[i].classId,
          instanceId: nodes[i].instanceId,
          id: nodes[i].id,
          showColorPicker: false,
          children: []
        });
        break;
      }
    }
    const child = refinedDataTree[0];
    // Once the vertix has been established we call insertChildren recursively on each child.
    this.insertChildren(nodes, edges, child, imagesMap);
    return refinedDataTree;
  }

  insertChildren (nodes, edges, child, imagesMap) {
    let childrenList = this.findChildren({ from: child.id }, "from", edges, "part of");
    // child.images = this.findChildren({ from: child.id }, "from", edges, "INSTANCEOF");
    let nodesList = [];
    for ( let i = 0; i < childrenList.length; i++) {
      nodesList.push(edges[childrenList[i]].to)
    }
    const uniqNodes = [...new Set(nodesList)];

    for ( var j = 0; j < uniqNodes.length; j++) {
      const node = nodes[this.findChildren({ id: uniqNodes[j] }, "id", nodes)[0]];
      child.children.push({
        title: node.title,
        subtitle: node.classId,
        description: node.info,
        classId: node.classId,
        instanceId: node.instanceId,
        id: node.id,
        showColorPicker: false,
        children: []
      });
      this.insertChildren(nodes, edges, child.children[j], imagesMap)
    }
  }

  findChildren (parent, key, familyList, label) {
    let childrenList = [];
    const childKey = this.searchChildren(familyList, key, parent, label);
    if (childKey !== undefined) {
      childrenList.push(childKey);
      let i = childKey - 1;
      while (i > 0 && this.isNumber(parent[key]) === this.isNumber(familyList[i][key])) {
        childrenList.push(i);
        i--;
      }
      i = childKey + 1;
      while (i < familyList.length && this.isNumber(parent[key]) === this.isNumber(familyList[i][key])) {
        childrenList.push(i);
        i++;
      }
    }
    return childrenList;
  }


  getTreeData(instance){
    return this.restPost(treeCypherQuery(instance)).then(data => {
      if (data.errors.length > 0) {
        console.log("-- ERROR TREE COMPONENT --");
        console.log(data.errors);
      }
      if (data.results.length > 0 && data.results[0].data.length > 0) {
        const dataTree = this.parseGraphResultData(data);
        const vertix = this.findRoot(data);
        const imagesMap = this.buildDictClassToIndividual(data);
        const nodes = this.sortData(this.convertNodes(dataTree.nodes, imagesMap), "id", this.defaultComparator);
        const edges = this.sortData(this.convertEdges(dataTree.edges), "from", this.defaultComparator);
        const treeData = this.convertDataForTree(nodes, edges, vertix, imagesMap);
        return treeData
      } else {
        var treeData = [{
          title: "No data available.",
          subtitle: null,
          children: []
        }];
        return treeData
      }
    })
  }

  getButtons(rowInfo) {
    // As per name, provided by the react-sortable-tree api, we use this to attach to each node custom buttons
    let buttons = [];
    let fillCondition = "unknown";
    let instanceLoaded = false;
    if (rowInfo.node.instanceId.indexOf("VFB_") > -1) {
      fillCondition = "3dAvailable";
      for (let i = 1; i < Instances.length; i++) {
        if (Instances[i].id !== undefined && Instances[i].id === rowInfo.node.instanceId) {
          instanceLoaded = true;
          break;
        }
      }
      if (!instanceLoaded) {
        fillCondition = "3dToLoad";
      } else {
        if ((typeof Instances[rowInfo.node.instanceId].isVisible !== "undefined") && (Instances[rowInfo.node.instanceId].isVisible())) {
          fillCondition = "3dVisible";
        } else {
          fillCondition = "3dHidden";
        }
      }
    }

    switch (fillCondition) {
      case "3dToLoad":
        buttons.push(<i className="fa fa-eye"
          aria-hidden="true"
          onClick={e => {
            e.stopPropagation();
            console.log("click")
          }} />);
        break;
      case "3dHidden":
        buttons.push(<i className="fa fa-eye"
          aria-hidden="true"
          onClick={e => {
            e.stopPropagation();
            console.log("click");
          }} />);
        break;
      case "3dVisible":
        var color = Instances[rowInfo.node.instanceId].getColor();
        buttons.push(<i className="fa fa-eye-slash"
          aria-hidden="true"
          onClick={e => {
            e.stopPropagation();
            console.log("click")
          }} />);
        buttons.push(<span
          onClick={e => {
            e.stopPropagation();
          }}>
          <i className="fa fa-tint"
            style={{
              paddingLeft: "6px",
              color: color
            }}
            aria-hidden="true"
            onClick={e => {
              e.stopPropagation();
              console.log("click")
            }} />
        </span>);
        break;
    }
    return buttons;
  }

  getNodes(rowInfo) {
    /*
     * In the getNodes, provided by the API of react-sortable-tree, if the node has visual capability
     * we attach the tooltip with the image, differently only tooltip.
     */
    if (rowInfo.node.title !== "No data available.") {
      var title = <MuiThemeProvider theme={this.theme}>
        <Tooltip placement="right-start"
          title={(rowInfo.node.instanceId.indexOf("VFB_") > -1)
            ? (<div>
              <div> {rowInfo.node.description} </div>
              <div>
                <img style={{ display: "block", textAlign: "center" }}
                  src={"https://VirtualFlyBrain.org/reports/" + rowInfo.node.instanceId + "/thumbnailT.png"} />
              </div></div>)
            : (<div>
              <div> {rowInfo.node.description} </div>
            </div>)}>
          <div
            onClick={e => {
              e.stopPropagation();
              console.log("click")
            }}>
            {rowInfo.node.title}
          </div>
        </Tooltip>
      </MuiThemeProvider>;
    }
    return title;
  }

  render() {
    const size = {
      width: "800px",
      height: "800px"
    }
    const row_height = 25;
    const treeData = this.getTreeData()
    return (
      <Tree
        id="VFBTree"
        toggleMode={true}
        treeData={treeData}
        activateParentsNodeOnClick={true}
        handleClick={this.nodeClick}
        style={{ width: size.width, height: size.height, float: 'left', clear: 'both' }}
        rowHeight={row_height}
        getButtons={this.getButtons}
        getNodesProps={this.getNodes}
        searchQuery={null}
        onlyExpandSearchedNodes={false}
      />
    );
  }
}