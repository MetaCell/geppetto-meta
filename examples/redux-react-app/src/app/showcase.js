import React, { useEffect, useState } from 'react';
import { getLayoutManagerInstance } from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
import CircularProgress from '@material-ui/core/CircularProgress';
import { useStore } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { CloseIcon } from './icons';

const useStyles = makeStyles({
    layoutContainer: {
        position: 'relative',
        width: '100%',
        height: '90vh',
        '&> div': {
            height: '100%',
        }
    }
});

/**
 * The component that renders the FlexLayout component of the LayoutManager.
 */
const MainLayout = () => {

    const classes = useStyles();
    const store = useStore();
    const [Component, setComponent] = useState(undefined);

  useEffect(() => {
    // Workaround because getLayoutManagerInstance
    // is undefined when calling it in global scope
    // Need to wait until store is ready ...
    // TODO: find better way to retrieve the LayoutManager component!
    if (Component === undefined) {
      const myManager = getLayoutManagerInstance();
      if (myManager) {
        setComponent(
          myManager.getComponent(
            {
            icons: {
              close: <CloseIcon />,
            },
            tabSetButtons: [
              ({ panel }) => {
                return (
                  <Button
                    key={panel.getId()}
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      console.log('tab-set button')
                    }}
                  >
                    Add
                  </Button>
                );
              },
            ],
            tabButtons: [
              ({ panel }) => {
                return (
                  <Button
                    key={panel.getId()}
                    variant="filled"
                    color="secondary"
                    onClick={() => {
                      console.log('tab button')
                    }}
                  >
                    Minimize
                  </Button>
                );
              },
            ],
          })
        );
      }
    }
  }, [Component, store]);
  console.log(Component, 'Component');


  return (
    <div className={classes.layoutContainer}>
      {Component === undefined ? (
        <CircularProgress />
      ) : (
        <Component />
      )}
    </div>
  );
};

export default MainLayout;
