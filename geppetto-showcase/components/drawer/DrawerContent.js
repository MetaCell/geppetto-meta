import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import ListItem from '@material-ui/core/ListItem';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Collapse from '@material-ui/core/Collapse';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  nested: {
    paddingLeft: theme.spacing(4),
    textDecoration: 'none',
    color: 'inherit',
  },

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
      previousTarget: null,
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

  updateColor(evt) {
    const { previousTarget } = this.state;
    const { theme } = this.props;

    if (previousTarget) {
      previousTarget.style.color = 'inherit';
    }
    evt.currentTarget.style.color = theme.palette.primary.main;
    const preTarget = evt.currentTarget;
    this.setState(() => {
      return { previousTarget: preTarget };
    });
  }

  render() {
    const {
      dataViewersOpen,
      navigationLayoutOpen,
      programmaticInterfacesOpen,
    } = this.state;

    const { classes } = this.props;

    const content = {
      'Data Viewers': {
        open: dataViewersOpen,
        handler: this.dataViewersHandler,
        children: [
          {
            name: 'Big Image Viewer',
            to: '/components/dataviewers/bigimgviewer',
          },
          {
            name: 'Connectivity Viewer',
            to: '/components/dataviewers/connectivity',
          },
          {
            name: 'Dicom Viewer',
            to: '/components/dataviewers/dicomviewer',
          },
          {
            name: 'Graph Visualizer',
            to: '/components/dataviewers/graphvisualizer',
          },
          {
            name: 'HTML Viewer',
            to: '/components/dataviewers/htmlviewer',
          },
          {
            name: 'Movie Player',
            to: '/components/dataviewers/movieplayer',
          },
          {
            name: 'Plot',
            to: '/components/dataviewers/plot',
          },
          {
            name: '3D Canvas',
            to: '/components/dataviewers/canvas',
            disabled: true,
          },
          {
            name: 'Stack Viewer',
            to: '/components/dataviewers/stackviewer',
            disabled: true,
          },
        ],
      },
      'Navigation/Layout': {
        open: navigationLayoutOpen,
        handler: this.navigationLayoutHandler,
        children: [
          {
            name: 'Flex Layout',
            to: '/components/navigation/flexlayout',
          },
          {
            name: 'List Viewer',
            to: '/components/navigation/listviewer',
          },
          {
            name: 'Menu',
            to: '/components/navigation/menu',
          },
          {
            name: 'Tree Viewer',
            to: '/components/navigation/treeviewer',
          },
        ],
      },
      'Programmatic Interfaces': {
        open: programmaticInterfacesOpen,
        handler: this.programmaticInterfacesHandler,
        children: [
          {
            name: 'Python Console',
            to: '/components/programmatic/pythonconsole',
          },
          {
            name: 'Javascript Console',
            to: '/components/programmatic/jsconsole',
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
                    const to = value.to;
                    const disabled = value.disabled;
                    return (
                      <ListItem
                        key={value.name}
                        button
                        className={classes.nested}
                        component={Link}
                        to={to}
                        disabled={disabled}
                        onClick={(evt) => this.updateColor(evt)}
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
