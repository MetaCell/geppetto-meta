import { useStore } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
import { useLayoutManager } from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
import "@metacell/geppetto-meta-client/common/layout/styles/dark.css";

const HomePage = () => {
  const store = useStore();
  const LayoutComponent = useLayoutManager(store);

  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        width: "100%",
        minHeight: "93vh",
        padding: 0,
        marginTop: 8,
      }}
    >
      {!LayoutComponent ? <CircularProgress /> : <LayoutComponent />}
    </Box>
  );
};

export default HomePage;
