import React, { Component } from 'react';
import ListItem from '@material-ui/core/ListItem';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Collapse from '@material-ui/core/Collapse';
import { withStyles } from '@material-ui/core/styles';

import ConnectivityMarkdown from '../../../geppetto-ui/src/components/connectivity-viewer/README.md';
import TreeMarkdown from '../../../geppetto-ui/src/components/tree-viewer/README.md';
import HTMLViewerMarkdown from '../../../geppetto-ui/src/components/html-viewer/README.md';

import { BigImageViewerConfig } from '../../../geppetto-ui/src/components/big-image-viewer/showcase/BigImageViewerConfig';
import MenuShowcase from '../../../geppetto-ui/src/components/menu/showcase/MenuShowcase';
import ListViewerShowcase from '../../../geppetto-ui/src/components/list-viewer/showcase/ListViewerShowcase';
import PlotShowcase from '../../../geppetto-ui/src/components/plot/showcase/PlotShowcase';
import FlexLayoutShowcase from '../../../geppetto-ui/src/components/flex-layout/showcase/FlexLayoutShowcase';
import MoviePlayerShowcase from '../../../geppetto-ui/src/components/movie-player/showcase/MoviePlayerShowcase';
import PythonConsoleShowcase from '../../../geppetto-ui/src/components/python-console/showcase/PythonConsoleShowcase';
import GraphVisualizationShowcase from '../../../geppetto-ui/src/components/graph-visualization/showcase/GraphVisualizationShowcase';
import Showcase from '../showcase/Showcase';
import { DicomViewerConfig } from '../../../geppetto-ui/src/components/dicom-viewer/showcase/DicomViewerConfig';

const styles = (theme) => ({
  nested: { paddingLeft: theme.spacing(4) },

  lists: {
    backgroundColor: theme.palette.background.paper,
    marginTop: theme.spacing(1),
  },
  listText: {
    fontWeight: 400,
    letterSpacing: 0,
    textTransform: 'none',
    fontSize: '0.875rem',
    textAlign: 'left',
  },
});

class DrawerContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataViewersOpen: true,
      navigationLayoutOpen: true,
      programmaticInterfacesOpen: true,
    };
    this.dataViewersHandler = this.dataViewersHandler.bind(this);
    this.navigationLayoutHandler = this.navigationLayoutHandler.bind(this);
    this.programmaticInterfacesHandler = this.programmaticInterfacesHandler.bind(
      this
    );
  }

  dataViewersHandler() {
    this.setState(() => ({ dataViewersOpen: !this.state.dataViewersOpen }));
  }

  navigationLayoutHandler() {
    this.setState(() => ({
      navigationLayoutOpen: !this.state.navigationLayoutOpen,
    }));
  }

  programmaticInterfacesHandler() {
    this.setState(() => ({
      programmaticInterfacesOpen: !this.state.programmaticInterfacesOpen,
    }));
  }

  render() {
    const {
      dataViewersOpen,
      navigationLayoutOpen,
      programmaticInterfacesOpen,
    } = this.state;
    const { classes, contentHandler } = this.props;

    const content = {
      'Data Viewers': {
        open: dataViewersOpen,
        handler: this.dataViewersHandler,
        children: [
          // {
          //   "name": "BigImageViewer",
          //   "component": <Showcase configs={BigImageViewerConfig}/>
          // },
          {
            name: 'Connectivity Viewer',
            component: <Showcase markdown={ConnectivityMarkdown} />,
          },
          // {
          //   "name": "DicomViewer",
          //   "component": <Showcase configs={DicomViewerConfig}/>
          // },

          {
            name: 'Graph Visualizer',
            component: <GraphVisualizationShowcase />,
          },
          {
            name: 'HTML Viewer',
            component: <Showcase markdown={HTMLViewerMarkdown} />,
          },
          {
            name: 'Movie Player',
            component: <MoviePlayerShowcase />,
          },
          {
            name: 'Plot',
            component: <PlotShowcase />,
          },
        ],
      },
      'Navigation/Layout': {
        open: navigationLayoutOpen,
        handler: this.navigationLayoutHandler,
        children: [
          {
            name: 'FlexLayout',
            component: <FlexLayoutShowcase />,
          },
          {
            name: 'List Viewer',
            component: <ListViewerShowcase />,
          },
          {
            name: 'Menu',
            component: <MenuShowcase />,
          },
          {
            name: 'Tree Viewer',
            component: <Showcase markdown={TreeMarkdown} />,
          },
        ],
      },
      'Programmatic Interfaces': {
        open: programmaticInterfacesOpen,
        handler: this.programmaticInterfacesHandler,
        children: [
          {
            name: 'Python Console',
            component: <PythonConsoleShowcase />,
          },
          {
            name: 'Javascript Console',
            component: '<JavascriptConsoleShowcase />',
            disabled: true,
          },
        ],
      },
    };
    return (
      <nav className={classes.lists} aria-label="mailbox folders">
        {Object.keys(content).map((key) => {
          const open = content[key].open;
          const handler = content[key].handler;
          const children = content[key].children;
          return (
            <List key={key}>
              <ListItem key={key} button onClick={handler}>
                <ListItemText className={classes.listText} primary={key} />
                {open != null ? open ? <ExpandLess /> : <ExpandMore /> : null}
              </ListItem>
              <Collapse component="li" in={open} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {children.map((value) => {
                    const name = value.name;
                    const component = value.component;
                    const disabled = value.disabled;
                    return (
                      <ListItem
                        key={value.name}
                        button
                        className={classes.nested}
                        onClick={() => contentHandler(component)}
                        disabled={disabled}
                      >
                        <ListItemText
                          className={classes.listText}
                          primary={name}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </List>
          );
        })}
      </nav>
    );
  }
}

export default withStyles(styles, { withTheme: true })(DrawerContent);
