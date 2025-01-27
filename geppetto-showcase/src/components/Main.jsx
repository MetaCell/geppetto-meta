import React, { Component, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';
import DrawerContent from './DrawerContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Search from './Search';
import pages from '../pages/index'
import Loader from '@metacell/geppetto-meta-ui/loader/Loader'
import Home from '../pages/home';

const drawerWidth = 240;
const styles = {
  root: { display: 'flex' },
  appBar: theme => ({ zIndex: theme.zIndex.drawer + 1 }),
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: { width: drawerWidth },
  content: {
    flexGrow: 1,
    padding: 3,
  },
  component: {
    width: '100%',
    height: '800px',
  },
  toolbar: theme => theme.mixins.toolbar,
  toolbarMainButton: theme => ({
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
  }),
  searchIcon: {
    width: 7,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: { color: 'inherit' },
  inputInput: theme => ({
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 120,
      '&:focus': { width: 200 },
    },
  }),
  grow: { flexGrow: 1, },
  sectionDesktop: theme => ({
    display: 'none',
    [theme.breakpoints.up('md')]: { display: 'flex', },
  }),
};

class Main extends Component {
  constructor (props) {
    super(props);
    this.state = {
      searchFilter: '',
      currentPage: '/',
    };
    this.searchHandler = this.searchHandler.bind(this);
    this.currentPageHandler = this.currentPageHandler.bind(this);
  }

  searchHandler (value) {
    this.setState(() => ({ searchFilter: value }));
  }

  currentPageHandler (value) {
    this.setState(() => ({ currentPage: value }));
  }

  render () {
    const { searchFilter } = this.state;

    return (
      <Router>
        <Box sx={styles.root}>
          <AppBar position="fixed" sx={styles.appBar}>
            <Toolbar>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <Button sx={styles.toolbarMainButton}>
                                        Geppetto Showcase
                </Button>
              </Link>
              <Search searchHandler={this.searchHandler}/>
              <Box sx={styles.grow}/>
              <Box sx={styles.sectionDesktop}>
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
              </Box>
            </Toolbar>
          </AppBar>
          <Drawer
            sx={styles.drawer}
            variant="permanent"
          >
            <Box sx={styles.toolbar}/>
            <DrawerContent
              searchFilter={searchFilter}
              currentPageHandler={this.currentPageHandler}
            />
          </Drawer>

          <Box component="main" sx={styles.content}>
            <Suspense fallback={<Loader active={true}/>}>
              <Box sx={styles.toolbar}/>
              <Box sx={styles.component}>
                <Switch>
                  {pages.filter(page => page.component != null).map(page => (
                    <Route
                      key={page.to}
                      path={page.to}
                      render={props => (<page.component {...props}
                        currentPageHandler={this.currentPageHandler}/>)}
                    />
                  ))}
                  <Route exact path="/" component={() => <Home />}/>
                </Switch>
              </Box>
            </Suspense>
          </Box>
        </Box>
      </Router>
    );
  }
}

export default Main;
