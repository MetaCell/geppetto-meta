import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ListItem from '@material-ui/core/ListItem';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Collapse from '@material-ui/core/Collapse';
import { withStyles } from '@material-ui/core/styles';
import pages from '../pages/index';
import stringSimilarity from 'string-similarity';

const styles = theme => ({
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
  constructor (props) {
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

  dataViewersHandler () {
    this.setState(() => ({ dataViewersOpen: !this.state.dataViewersOpen }));
  }

  navigationLayoutHandler () {
    this.setState(() => ({ navigationLayoutOpen: !this.state.navigationLayoutOpen, }));
  }

  programmaticInterfacesHandler () {
    this.setState(() => ({ programmaticInterfacesOpen: !this.state.programmaticInterfacesOpen, }));
  }


  isActivePage (page) {
    const { currentPage } = this.props;
    if (`/${window.location.href.split('/').slice(3).join('/')}` !== page) {
      return false;
    } else {
      return true;
    }
  }

  filterContent (searchFilter) {
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

    let componentsNames = pages.map(page => page.name);

    const matches = stringSimilarity.findBestMatch(
      searchFilter,
      componentsNames
    );

    const filteredContent = this.bestMatches(
      matches.ratings,
      matches.bestMatch.rating
    );
    let filteredComponentsNames = filteredContent.map(elem => elem.target.toLowerCase());

    for (let page of pages) {
      if (filteredComponentsNames.includes(page.name.toLowerCase())) {
        content[page.parent].children.push({
          name: page.name,
          to: page.to,
          disabled: page.component === null,
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

  bestMatches (ratings, bestRating, threshold = 0.2) {
    return ratings.filter(rating => rating.rating >= bestRating - threshold);
  }

  render () {
    const { classes, theme, searchFilter, currentPageHandler } = this.props;
    const content = this.filterContent(searchFilter);

    return (
      <nav className={classes.lists} aria-label="mailbox folders">
        {Object.keys(content).map(key => {
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
                  {children.map(value => {
                    const name = value.name;
                    const to = value.to;
                    const disabled = value.disabled;
                    return (
                      <ListItem
                        key={value.name}
                        button
                        {...(this.isActivePage(to) && { style: { color: theme.palette.primary.main }, })}
                        className={classes.nested}
                        component={Link}
                        to={to}
                        disabled={disabled}
                        onClick={() => currentPageHandler(to)}
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
