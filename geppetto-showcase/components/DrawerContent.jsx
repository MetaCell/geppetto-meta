import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ListItem from '@material-ui/core/ListItem';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Collapse from '@material-ui/core/Collapse';
import { withStyles } from '@material-ui/core/styles';
import Pages from '../pages/Pages';
import stringSimilarity from 'string-similarity';

const styles = (theme) => ({
  nested: {
    paddingLeft: theme.spacing(4),
    textDecoration: 'none',
    outline: 'none',
    color: 'inherit',
    '&:hover': {
      textDecoration: 'none',
      outline: 'none',
      color: 'inherit',
    },
    '&:focus': {
      textDecoration: 'none',
      outline: 'none',
      color: 'inherit',
    },
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

  filterContent(searchFilter) {
    const {
      dataViewersOpen,
      navigationLayoutOpen,
      programmaticInterfacesOpen,
    } = this.state;

    const content = {
      'Data Viewers': {
        open: dataViewersOpen,
        handler: this.dataViewersHandler,
        children: [],
      },
      'Navigation/Layout': {
        open: navigationLayoutOpen,
        handler: this.navigationLayoutHandler,
        children: [],
      },
      'Programmatic Interfaces': {
        open: programmaticInterfacesOpen,
        handler: this.programmaticInterfacesHandler,
        children: [],
      },
    };

    let componentsNames = Pages.map((page) => {
      return page.name;
    });

    const matches = stringSimilarity.findBestMatch(
      searchFilter,
      componentsNames
    );

    const filteredContent = this.bestMatches(
      matches.ratings,
      matches.bestMatch.rating
    );
    let filteredComponentsNames = filteredContent.map((elem) => {
      return elem.target.toLowerCase();
    });

    for (let page of Pages) {
      if (filteredComponentsNames.includes(page.name.toLowerCase())) {
        content[page.parent].children.push({
          name: page.name,
          to: page.to,
          disabled: page.markdown === null,
        });
      }
    }

    for (let key in content) {
      if (content[key].children.length === 0) {
        delete content[key];
      }
    }
    return content;
  }

  bestMatches(ratings, bestRating, threshold = 0.2) {
    return ratings.filter((rating) => {
      return rating.rating >= bestRating - threshold;
    });
  }

  render() {
    const { classes, searchFilter } = this.props;
    const content = this.filterContent(searchFilter);

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
