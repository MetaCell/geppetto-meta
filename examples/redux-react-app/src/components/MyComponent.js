import React from 'react';
import GraphVisualizationShowcase from '@metacell/geppetto-meta-ui/graph-visualization/showcase/examples/GraphVisualizationShowcase';

/**
 * Any custom component you can imagine.
 * 
 * This component is referenced in the `app/componentMap.js`.
 */

export const MyComponent = (props) => {

    const { title, text, data } = props;

    return (
        <div>
            <h1>{title}</h1>
            <p>{text}</p>
            <div style={{ display: 'flex', justifyContent: 'center'}}>
                <GraphVisualizationShowcase data={data}/>
            </div>
        </div>
    )
}