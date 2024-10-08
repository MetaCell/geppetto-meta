import {
  HomeOutlined,
  PlayArrowOutlined,
  SettingsOutlined,
  TonalityOutlined,
} from "@mui/icons-material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { Box, Divider, IconButton, Popover } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { useRef, useState } from "react";
import CustomFormControlLabel from "../../CustomFormControlLabel.tsx";
import {updateColor} from "../../../redux/slices/instanceSlice.ts";
import {useDispatch} from "react-redux";

function SceneControls({
  cameraControlRef,
  isWireframe,
  setIsWireframe,
  instances,
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const rotateAnimationRef = useRef<number | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const dispatch = useDispatch();

  const open = Boolean(anchorEl);
  const id = open ? "settings-popover" : undefined;

  const handleColorChange = (color, id) => {
    dispatch(updateColor({ id, color }));
  };

  const handleOpenSettings = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseSettings = () => {
    setAnchorEl(null);
  };

  const handleRotation = () => {
    if (!cameraControlRef.current) return;

    const rotate = () => {
      cameraControlRef.current.rotate(0.01, 0, true);
      rotateAnimationRef.current = requestAnimationFrame(rotate);
    };

    if (isRotating) {
      if (rotateAnimationRef.current) {
        cancelAnimationFrame(rotateAnimationRef.current);
        rotateAnimationRef.current = null;
      }
    } else {
      rotate();
    }

    setIsRotating(!isRotating);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: ".25rem",
        position: "absolute",
        top: ".5rem",
        left: ".5rem",
        backgroundColor: "#fff",
        borderRadius: "0.5rem",
        border: "1px solid #ECECE9",
        boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
        padding: "0.25rem",
      }}
    >
      <Tooltip title="Change settings" placement="right-start">
        <IconButton onClick={handleOpenSettings}>
          <SettingsOutlined />
        </IconButton>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseSettings}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              width: "13.75rem",
              padding: "0.25rem 0rem",
              borderRadius: "0.5rem",

              "& .MuiDivider-root": {
                margin: ".25rem 0",
              },
            },
          },
        }}
      >
        <Box
          sx={{
            padding: "0.5rem 0.25rem 0.5rem 0",
          }}
        >
          {instances?.map((instance) => (
            <CustomFormControlLabel
              label={instance.id}
              color={instance.color}
              handleColorChange={(color) => handleColorChange(color, instance.id)}
            />
          ))}
        </Box>
      </Popover>
      <Divider />
      <Tooltip title="Toggle Wireframe" placement="right-start">
        <IconButton onClick={() => setIsWireframe(!isWireframe)}>
          <TonalityOutlined />
        </IconButton>
      </Tooltip>
      <Divider />
      <Tooltip title="Zoom in" placement="right-start">
        <IconButton
          onClick={() => {
            cameraControlRef.current?.zoom(
              cameraControlRef.current?._camera.zoom / 2,
              true,
            );
          }}
        >
          <ZoomInIcon />
        </IconButton>
      </Tooltip>
      <Tooltip
        title="Reset to original size and position"
        placement="right-start"
      >
        <IconButton
          onClick={() => {
            cameraControlRef.current?.reset(true);
          }}
        >
          <HomeOutlined />
        </IconButton>
      </Tooltip>
      <Tooltip title="Zoom out" placement="right-start">
        <IconButton
          onClick={() => {
            cameraControlRef.current?.zoom(
              -cameraControlRef.current?._camera.zoom / 2,
              true,
            );
          }}
        >
          <ZoomOutIcon />
        </IconButton>
      </Tooltip>
      <Divider />
      <Tooltip title="Play 3D viewer" placement="right-start">
        <IconButton onClick={handleRotation}>
          <PlayArrowOutlined />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default SceneControls;
