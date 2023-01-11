import React, { useEffect, useState } from 'react';
import { getLayoutManagerInstance } from '@metacell/geppetto-meta-client/common/layout/LayoutManager';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useStore } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CLOSE from '../icons/close.svg';

const useStyles = makeStyles({
  layoutContainer: {
    position: 'relative',
    width: '100%',
    height: '90vh',
    '&> div': {
      height: '100%',
    },
  },
});

const SvgComponent = (props) => (
  <svg
    width={8}
    height={8}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="m.75.75 6.5 6.5m0-6.5-6.5 6.5"
      stroke="#000"
      strokeWidth={1.5}
      opacity={0.2}
    />
  </svg>
);

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
          myManager.getComponent({
            icons: {
              close: <SvgComponent />,
            },
            tabSetButtons: [
              ({ panel }) => {
                return (
                  <Button
                    key={panel.getId()}
                    variant="outlined"
                    color="primary"
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
  }, [store]);

  return (
    <div className={classes.layoutContainer}>
      {Component === undefined ? <CircularProgress /> : <Component />}
    </div>
  );
};

export default MainLayout;
