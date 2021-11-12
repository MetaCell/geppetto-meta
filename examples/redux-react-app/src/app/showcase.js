import React, { useEffect, useState } from 'react';
import { getLayoutManagerInstance } from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
import CircularProgress from '@material-ui/core/CircularProgress';
import { useStore } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    layoutContainer: {
        position: 'relative',
        width: '100%',
        height: '90vh'
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
                setComponent(myManager.getComponent());
            }
        }
    }, [store])

    return (
        <div className={classes.layoutContainer}>
            {Component === undefined ? <CircularProgress /> : <Component />}
        </div>
    );
}

export default MainLayout;
