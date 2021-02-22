import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import pages from '../pages/Pages';
import { Link } from 'react-router-dom';

const styles = (theme) => ({
  root: {
    width: '100%',
    display: 'flex',
  },
  grow: {
    flexGrow: 1,
  },
  divider: {
    marginBottom: theme.spacing(2),
  },
});

class BottomNavigation extends Component {
  getPages() {
    const currentPath = window.location.pathname;
    let nextPage = null;
    let previousPage = null;
    let next = 1;
    let previous = -1;
    const activePages = pages.filter((page) => {
      return page.markdown != null;
    });
    for (let i = 0; i < activePages.length; i++) {
      let page = activePages[i];
      if (page.to === currentPath) {
        if (next < activePages.length) {
          nextPage = activePages[next];
        }
        if (previous > -1) {
          previousPage = activePages[previous];
        }
      }
      next++;
      previous++;
    }

    return { previous: previousPage, next: nextPage };
  }

  render() {
    const { classes, currentPageHandler } = this.props;
    const pages = this.getPages();
    return (
      <div>
        <Divider variant="middle" className={classes.divider} />
        <div className={classes.root}>
          {pages.previous !== null ? (
            <Link to={pages.previous.to} style={{ textDecoration: 'none' }}>
              <Button
                size="small"
                onClick={() => currentPageHandler(pages.previous.to)}
              >
                <KeyboardArrowLeft />
                {pages.previous.name}
              </Button>
            </Link>
          ) : null}
          <span className={classes.grow} />
          {pages.next !== null ? (
            <Link to={pages.next.to} style={{ textDecoration: 'none' }}>
              <Button
                size="small"
                onClick={() => currentPageHandler(pages.next.to)}
                disabled={pages.next === null}
              >
                {pages.next.name}
                <KeyboardArrowRight />
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(BottomNavigation);
