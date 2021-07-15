import React from 'react';
import { Button } from '@material-ui/core';

/**
 * Any custom component you can imagine.
 * 
 * This component is referenced in the `app/componentMap.js`.
 */
export const MyComponent = () => {

    return (
        <div>
            <Button>Click me</Button>
            <h1>My Component</h1>
            <p>Yeah it works</p>
        </div>
    )
}