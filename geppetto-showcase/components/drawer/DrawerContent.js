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
import BigImageViewerMarkdown from '../../../geppetto-ui/src/components/big-image-viewer/README.md';
import DicomViewerMarkdown from '../../../geppetto-ui/src/components/dicom-viewer/README.md';
import MenuMarkdown from '../../../geppetto-ui/src/components/menu/README.md';
import MoviePlayerMarkdown from '../../../geppetto-ui/src/components/movie-player/README.md';
import PlotMarkdown from '../../../geppetto-ui/src/components/plot/README.md';
import GraphVisualizationMarkdown from '../../../geppetto-ui/src/components/graph-visualization/README.md';
import FlexlayoutMarkdown from '../../../geppetto-ui/src/components/flex-layout/README.md';
import ListViewerMarkdown from '../../../geppetto-ui/src/components/list-viewer/README.md';
import PythonConsoleShowcase from '../../../geppetto-ui/src/components/python-console/showcase/PythonConsoleShowcase';
import Showcase from '../showcase/Showcase';

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
          {
            name: 'Big Image Viewer',
            component: <Showcase markdown={BigImageViewerMarkdown} />,
          },
          {
            name: 'Connectivity Viewer',
            component: <Showcase markdown={ConnectivityMarkdown} />,
          },
          {
            name: 'Dicom Viewer',
            component: <Showcase markdown={DicomViewerMarkdown} />,
          },

          {
            name: 'Graph Visualizer',
            component: <Showcase markdown={GraphVisualizationMarkdown} />,
          },
          {
            name: 'HTML Viewer',
            component: <Showcase markdown={HTMLViewerMarkdown} />,
          },
          {
            name: 'Movie Player',
            component: <Showcase markdown={MoviePlayerMarkdown} />,
          },
          {
            name: 'Plot',
            component: <Showcase markdown={PlotMarkdown} />,
          },
        ],
      },
      'Navigation/Layout': {
        open: navigationLayoutOpen,
        handler: this.navigationLayoutHandler,
        children: [
          /**
           * Awaiting tsx support in showcase
           * {
           * name: 'FlexLayout',
           * component: <Showcase markdown={FlexlayoutMarkdown} />,
           * },
           */
          {
            name: 'List Viewer',
            component: <Showcase markdown={ListViewerMarkdown} />,
          },
          {
            name: 'Menu',
            component: <Showcase markdown={MenuMarkdown} />,
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
