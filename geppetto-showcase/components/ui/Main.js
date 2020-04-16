import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Drawer from "@material-ui/core/Drawer";
import DrawerContent from "./DrawerContent";

const drawerWidth = 240;

const styles = theme => ({
  root: { display: 'flex', },
  appBar: { zIndex: theme.zIndex.drawer + 1, },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: { width: drawerWidth, },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  component: {
    width: "100%",
    height: "800px",
  },
  toolbar: theme.mixins.toolbar,
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: { color: 'inherit', },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 120,
      '&:focus': { width: 200, },
    },
  },

});

const homeContent = (
  <Fragment>
    <Typography paragraph>
        Skip to the science.
        The visualisation and simulation platform focused on what matters to you.
    </Typography>
    <Typography paragraph>
        Some of the react components responsible for giving you an amazing experience.
    </Typography>
  </Fragment>
);

class Main extends Component {

  constructor (props) {
    super(props);

    this.state = { content: homeContent };
    this.contentHandler = this.contentHandler.bind(this)
  }

  contentHandler (content){
    this.setState(() => ({ content: content }))
  }
  render () {
    const { classes } = this.props;
    const { content } = this.state;

    return (
      <div className={classes.root}>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" noWrap>
                            Geppetto Showcase
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{ paper: classes.drawerPaper, }}
        >
          <div className={classes.toolbar}/>
          <DrawerContent contentHandler={this.contentHandler}/>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.toolbar}/>
          <div className={classes.component}>
              {content}
          </div>
        </main>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Main);