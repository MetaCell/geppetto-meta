import React, {useEffect, useState} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {Box, Button, CircularProgress} from "@mui/material";
// @ts-ignore
import {getLayoutManagerInstance} from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
// @ts-ignore
import {addWidget} from '@metacell/geppetto-meta-client/common/layout/actions';
import '@metacell/geppetto-meta-ui/flex-layout/style/dark.scss'

import {component1Widget, component2Widget} from "../widgets";

const HomePage = () => {
    const store = useStore();
    const dispatch = useDispatch();
    const [LayoutComponent, setLayoutComponent] = useState<any | undefined>(undefined);

    useEffect(() => {
        if (LayoutComponent === undefined) {
            const myManager = getLayoutManagerInstance();
            if (myManager) {
                setLayoutComponent(myManager.getComponent() as React.ComponentType<any>);
            }
        }
    }, [store])


    useEffect(() => {
        dispatch(addWidget(component1Widget()))
    }, [LayoutComponent])


    const addComponent1 = () => {
        dispatch(addWidget(component1Widget()));
    };

    const addComponent2 = () => {
        dispatch(addWidget(component2Widget()));
    };

    return (
        <Box>
            <Box sx={{
                width: '100%',
                height: '4vh',
            }}>
                <Button variant="contained" onClick={addComponent1}>
                    Add Component 1
                </Button>
                <Button variant="contained" onClick={addComponent2}>
                    Add Component 2
                </Button>
            </Box>
            <Box sx={{
                display: 'flex',
                position: 'relative',
                width: '100%',
                height: '96vh',
            }}>
                {LayoutComponent === undefined ? <CircularProgress/> : <LayoutComponent/>}
            </Box>
        </Box>
    );
}

export default HomePage;