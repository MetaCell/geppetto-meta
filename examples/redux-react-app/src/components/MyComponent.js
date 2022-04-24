import React from 'react';
import GraphVisualizationShowcase from '../examples/GraphVisualizationShowcase';

/**
 * Any custom component you can imagine.
 * 
 * This component is referenced in the `app/componentMap.js`.
 */
export const MyComponent = (props) => {

    const { text } = props;

    return (
        <div>
            <h1>Robert Frost</h1>
            <p>{text}</p>
            <div style={{ display: 'flex', justifyContent: 'center'}}>
                <GraphVisualizationShowcase />
            </div>
        </div>
    )
}