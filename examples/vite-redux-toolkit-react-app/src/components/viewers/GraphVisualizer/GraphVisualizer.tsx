import React from 'react';
import Graph from '@metacell/geppetto-meta-ui/graph-visualization/Graph';
import Box from "@mui/material/Box";

const GraphVisualization = () => {
  
  const getData = () => {
    return {
      nodes: [
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ],
      links: [
        { source: 1, target: 2 },
        { source: 2, target: 3 },
        { source: 3, target: 1 }
      ]
    };
  };
  
  return (
    <Box sx={{ width: 600, height: '100%' }}>
      <Graph
        data={getData()}
        nodeLabel={node => node.name}
        linkLabel={link => link.name}
        nodeRelSize={5}
      />
    </Box>
  );
};

export default GraphVisualization;
