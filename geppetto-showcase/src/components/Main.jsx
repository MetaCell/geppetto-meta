import React, { Component, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Drawer from '@material-ui/core/Drawer';
import DrawerContent from './DrawerContent';
import Button from '@material-ui/core/Button';
import Search from './Search';
import pages from '../pages/index'
import Loader from '@geppettoengine/geppetto-ui/loader/Loader'
const Home = lazy(() => import('../pages/home'));

const drawerWidth = 240;
const styles = theme => ({
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
  grow: { flexGrow: 1, },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: { display: 'flex', },
  },
});

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
    const { classes } = this.props;
    const { searchFilter, currentPage } = this.state;

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
              <Search searchHandler={this.searchHandler}/>
              <div className={classes.grow}/>
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
            <div className={classes.toolbar}/>
            <DrawerContent
              searchFilter={searchFilter}
              currentPage={currentPage}
              currentPageHandler={this.currentPageHandler}
            />
          </Drawer>

          <main className={classes.content}>
            <Suspense fallback={<Loader active={true}/>}>
              <div className={classes.toolbar}/>
              <div className={classes.component}>
                <Switch>
                  {pages.filter(page => page.component != null).map(page => (
                    <Route
                      key={page.to}
                      path={page.to}
                      render={props => (<page.component {...props}
                        currentPageHandler={this.currentPageHandler}/>)}
                    />
                  ))}
                  <Route exact path="/" component={Home}/>
                </Switch>
              </div>
            </Suspense>
          </main>
        </div>
      </Router>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Main);
