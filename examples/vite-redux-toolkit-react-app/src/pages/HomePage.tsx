import type React from 'react';
import { useEffect, useState } from 'react';
import { useStore } from 'react-redux';
import {
  Box,
  CircularProgress,
} from "@mui/material"
import { getLayoutManagerInstance } from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
const HomePage = () => {
  const store = useStore();
  const [LayoutComponent, setLayoutComponent] = useState<any | undefined>(undefined);
  
  useEffect(() => {
    if (LayoutComponent === undefined) {
      const myManager = getLayoutManagerInstance();
      if (myManager) {
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        setLayoutComponent(myManager.getComponent() as React.ComponentType<any>);
      }
    }
  }, [store, LayoutComponent])
  
  return (
    <Box sx={{
      display: 'flex',
      position: 'relative',
      width: '100%',
      minHeight: '93vh',
      padding: 0,
      marginTop: 8
    }}>
      {LayoutComponent === undefined ? <CircularProgress/> : <LayoutComponent/>}
    </Box>
  );
}

export default HomePage;