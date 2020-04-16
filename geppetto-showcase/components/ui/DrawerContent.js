import React, { Component } from "react";
import ListItem from "@material-ui/core/ListItem";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import Collapse from "@material-ui/core/Collapse";
import { withStyles } from "@material-ui/core/styles";

import ConnectivityMarkdown from '../../../geppetto-ui/src/components/connectivity-viewer/README.md';

import {BigImageViewerConfig}
  from "../../../geppetto-ui/src/components/big-image-viewer/showcase/BigImageViewerConfig";
import MenuShowcase from "../../../geppetto-ui/src/components/menu/showcase/MenuShowcase";
import ListViewerShowcase from "../../../geppetto-ui/src/components/list-viewer/showcase/ListViewerShowcase";
import PlotShowcase from "../../../geppetto-ui/src/components/plot/showcase/PlotShowcase";
import FlexLayoutShowcase from "../../../geppetto-ui/src/components/flex-layout/showcase/FlexLayoutShowcase";
import MoviePlayerShowcase from "../../../geppetto-ui/src/components/movie-player/showcase/MoviePlayerShowcase";
import PythonConsoleShowcase from "../../../geppetto-ui/src/components/python-console/showcase/PythonConsoleShowcase";
import GraphVisualizationShowcase from "../../../geppetto-ui/src/components/graph-visualization/showcase/GraphVisualizationShowcase";
import Showcase from "../utilities/Showcase";
import {DicomViewerConfig} from "../../../geppetto-ui/src/components/dicom-viewer/showcase/DicomViewerConfig";

const styles = theme => ({
  nested: { paddingLeft: theme.spacing(4), },

  lists: {
    backgroundColor: theme.palette.background.paper,
    marginTop: theme.spacing(1),
  },
});


class DrawerContent extends Component {
  constructor (props) {
    super(props);
    this.state = {
      interfaceOpen: false,
      controlsOpen: false
    };
    this.interfaceHandler = this.interfaceHandler.bind(this);
    this.controlsHandler = this.controlsHandler.bind(this);
  }

  interfaceHandler () {
    this.setState(() => ({ interfaceOpen: !this.state.interfaceOpen }))
  }

  controlsHandler () {
    this.setState(() => ({ controlsOpen: !this.state.controlsOpen }))
  }

  render () {
    const { interfaceOpen, controlsOpen } = this.state;
    const { classes, contentHandler } = this.props;

    const content = {
      "Interface": {
        "open": interfaceOpen,
        "handler": this.interfaceHandler,
        "children": [
          // {
          //   "name": "BigImageViewer",
          //   "component": <Showcase configs={BigImageViewerConfig}/>
          // },
          {
            "name": "Connectivity",
            "component": <Showcase markdown={ConnectivityMarkdown}/>
          },
          // {
          //   "name": "DicomViewer",
          //   "component": <Showcase configs={DicomViewerConfig}/>
          // },
          {
            "name": "FlexLayout",
            "component": <FlexLayoutShowcase/>
          },
          {
            "name": "GraphVisualizer",
            "component": <GraphVisualizationShowcase/>
          },
          {
            "name": "MoviePlayer",
            "component": <MoviePlayerShowcase/>
          },
          {
            "name": "Plot",
            "component": <PlotShowcase/>
          },
          {
            "name": "PythonConsole",
            "component": <PythonConsoleShowcase/>
          },
        ]
      },
      "Controls": {
        "open": controlsOpen,
        "handler": this.controlsHandler,
        "children": [
          {
            "name": "ListViewer",
            "component": <ListViewerShowcase/>
          },
          {
            "name": "Menu",
            "component": <MenuShowcase/>
          },
        ]
      },
    };
    return (
        <nav className={classes.lists} aria-label="mailbox folders">
            {Object.keys(content).map(key => {
              const open = content[key].open;
              const handler = content[key].handler;
              const children = content[key].children;
              return (
                  <List key={key}>
                    <ListItem key={key} button onClick={handler}>
                      <ListItemText primary={key}/>
                      {open != null ? open ? <ExpandLess/> : <ExpandMore/> : null}
                    </ListItem>
                    <Collapse component="li" in={open} timeout="auto" unmountOnExit>
                      <List disablePadding>
                        {children.map(value => {
                          const name = value.name;
                          const component = value.component;
                          return (
                              <ListItem key={value.name} button className={classes.nested} onClick={() => contentHandler(component)}>
                                <ListItemText primary={name}/>
                              </ListItem>
                          )
                        })}
                      </List>
                    </Collapse>
                  </List>
              )
            })}
        </nav>
    );
  }
}

export default withStyles(styles, { withTheme: true })(DrawerContent);