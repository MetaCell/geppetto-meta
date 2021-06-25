import React, { useEffect, useState } from 'react';
import { getLayoutManagerInstance } from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
import CircularProgress from '@material-ui/core/CircularProgress';
import { useStore } from 'react-redux';

/**
 * The component that renders the FlexLayout component of the LayoutManager.
 */
const MainLayout = () => {

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
        <div style={{ position: 'relative', width: '100%', height: '80vh'}}>
            {Component === undefined ? <CircularProgress /> : <Component />}
        </div>
    );
}

export default MainLayout;