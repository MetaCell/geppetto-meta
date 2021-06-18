import React, { useEffect, useState } from 'react';
import { getLayoutManagerInstance } from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
import CircularProgress from '@material-ui/core/CircularProgress';
import { useStore } from 'react-redux';

const FlexLayoutShowcase = () => {

    const store = useStore();
    const [Component, setComponent] = useState(undefined);

    useEffect(() => {
        // Workaround because getLayoutManagerInstance 
        // is undefined when calling it in global scope
        // Need to wait until store is ready ...
        if (Component === undefined) {
            const myManager = getLayoutManagerInstance();
            if (myManager) {
                setComponent(myManager.getComponent());
            }
        }
    }, [store])

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%', minHeight: '500px' }}>
            {
                Component === undefined ? <CircularProgress /> : <Component />
            }
        </div>
    );
}

export default FlexLayoutShowcase;