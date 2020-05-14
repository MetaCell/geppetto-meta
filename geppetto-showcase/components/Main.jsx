import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Drawer from '@material-ui/core/Drawer';
import DrawerContent from './DrawerContent';
import Button from '@material-ui/core/Button';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Pages from '../pages/Pages';
import Home from '../pages/Home';
import Showcase from './showcase/Showcase';
import Search from './Search';

const drawerWidth = 240;

const styles = (theme) => ({
  root: { display: 'flex' },
  appBar: { zIndex: theme.zIndex.drawer + 1 },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: { width: drawerWidth },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  component: {
    width: '100%',
    height: '800px',
  },
  toolbar: theme.mixins.toolbar,
  toolbarMainButton: {
    color: 'white',
    opacity: '70%',
    fontSize: '16px',
    fontWeight: '500',
    letterSpacing: '0.0075em',
    justifyContent: 'left',
    flex: 1,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      opacity: '60%',
    },
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: { color: 'inherit' },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 120,
      '&:focus': { width: 200 },
    },
  },
  grow: {
    flexGrow: 1,
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
});

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchFilter: '',
    };
    this.searchHandler = this.searchHandler.bind(this);
  }

  searchHandler(value) {
    this.setState(() => {
      return { searchFilter: value };
    });
  }

  render() {
    const { classes } = this.props;
    const { searchFilter } = this.state;

    return (
      <Router>
        <div className={classes.root}>
          <AppBar position="fixed" className={classes.appBar}>
            <Toolbar>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <Button className={classes.toolbarMainButton}>
                  Geppetto Showcase
                </Button>
              </Link>
              <Search searchHandler={this.searchHandler} />
              <div className={classes.grow} />
              <div className={classes.sectionDesktop}>
                <Button
                  href="http://docs.geppetto.org/en/latest/"
                  target="_blank"
                >
                  Docs
                </Button>
                <Button
                  href="https://github.com/openworm/org.geppetto"
                  target="_blank"
                >
                  Github
                </Button>
                <Button href="https://goo.gl/3ncZWn" target="_blank">
                  Slack
                </Button>
              </div>
            </Toolbar>
          </AppBar>
          <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{ paper: classes.drawerPaper }}
          >
            <div className={classes.toolbar} />
            <DrawerContent searchFilter={searchFilter} />
          </Drawer>

          <main className={classes.content}>
            <div className={classes.toolbar} />
            <div className={classes.component}>
              <Switch>
                {Pages.map((page) => (
                  <Route
                    key={page.to}
                    path={page.to}
                    render={() => <Showcase markdown={page.markdown} />}
                  />
                ))}
                <Route path="/" exact component={Home} />
              </Switch>
            </div>
          </main>
        </div>
      </Router>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Main);
