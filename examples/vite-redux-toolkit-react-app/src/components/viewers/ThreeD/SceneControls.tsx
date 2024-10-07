import GridOnIcon from '@mui/icons-material/GridOn';
import GridOffIcon from '@mui/icons-material/GridOff';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import HouseIcon from '@mui/icons-material/House';
import {Box, IconButton} from "@mui/material";

function SceneControls({cameraControlRef, isWireframe, setIsWireframe}) {
  console.log(cameraControlRef)
  
  return (
    <Box position="absolute" top={20} left={20} display="flex" gap="10px" sx={{background: 'white'}}>
      <IconButton onClick={() => {
        cameraControlRef.current?.reset(true);
      }} title="Reset">
        <HouseIcon/>
      </IconButton>
      <IconButton onClick={() => {
        cameraControlRef.current?.zoom(cameraControlRef.current?._camera.zoom / 2, true);
      }} title="Zoom In">
        <ZoomInIcon/>
      </IconButton>
      <IconButton onClick={() => {
        cameraControlRef.current?.zoom(-cameraControlRef.current?._camera.zoom / 2, true);
      }} title="Zoom Out">
        <ZoomOutIcon/>
      </IconButton>
      <IconButton
        color="default"
        onClick={() => setIsWireframe(!isWireframe)}
        title="Toggle Wireframe"
      >
        {isWireframe ? <GridOnIcon/> : <GridOffIcon/>}
      </IconButton>
    </Box>
  );
}

export default SceneControls;