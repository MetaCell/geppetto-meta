import {Box, CircularProgress} from "@mui/material";
import {useEffect, useState} from "react";
import { getLayoutManagerInstance } from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
const HomePage = () => {
  const [LayoutComponent, setLayoutComponent] = useState<any | undefined>(undefined);

  useEffect(() => {
    if (LayoutComponent === undefined) {
      const myManager = getLayoutManagerInstance();
      if (myManager) {
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        setLayoutComponent(myManager.getComponent() as React.ComponentType<any>);
      }
    }
  }, [LayoutComponent])
  
  
  return (
    <Box p={2} sx={{
      display: 'flex',
      position: 'relative',
      width: '100%',
      height: '90vh',
    }}>
      {LayoutComponent === undefined ? <CircularProgress/> : <LayoutComponent/>}
    </Box>
  );
}

export default HomePage;