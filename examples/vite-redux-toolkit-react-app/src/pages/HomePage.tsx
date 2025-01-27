import type React from 'react';
import { useMemo } from 'react';
import { useStore } from 'react-redux';
import {
  Box,
  CircularProgress,
} from "@mui/material"
import { getLayoutManagerInstance } from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
import '@metacell/geppetto-meta-client/common/layout/styles/dark.css'

const HomePage = () => {
  const store = useStore();
  const LayoutComponent = useMemo(() => {
    return getLayoutManagerInstance()?.getComponent()
  }, [store])


  return (
    <Box sx={{
      display: 'flex',
      position: 'relative',
      width: '100%',
      minHeight: '93vh',
      padding: 0,
      marginTop: 8
    }}>
      {LayoutComponent === undefined ? <CircularProgress /> : <LayoutComponent />}
    </Box>
  );
}

export default HomePage;