import React, { Component } from 'react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Box from '@mui/material/Box';
import pages from '../pages/index';
import { Link } from 'react-router-dom';

const styles = {
  root: {
    width: '100%',
    display: 'flex',
  },
  grow: { flexGrow: 1, },
  divider: theme => ({ marginBottom: theme.spacing(2), }),
};

class BottomNavigation extends Component {
  getPages () {
    const currentPath = window.location.pathname;
    let nextPage = null;
    let previousPage = null;
    let next = 1;
    let previous = -1;
    const activePages = pages.filter(page => page.component != null);
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

  render () {
    const { currentPageHandler } = this.props;
    const pages = this.getPages();
    return (
      <div>
        <Divider variant="middle" sx={styles.divider} />
        <Box sx={styles.root}>
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
          <Box component="span" sx={styles.grow} />
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
        </Box>
      </div>
    );
  }
}

export default BottomNavigation;
