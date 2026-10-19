import React from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { type Theme } from "@mui/material/styles";
import { useAppDispatch } from "../redux/store";
import { addWidget, deleteWidget } from "@metacell/geppetto";
import { canvas3DWidget, dicomViewerWidget, infoWidget } from "../layoutManager/widgets";
import { ViewerType } from "../models";
import { vars } from "../theme/variables";
import CustomSwitch from "./CustomSwitch";

const { gray600, gray900A } = vars;
const DRAWER_WIDTH = 240;

const WIDGETS = {
  [ViewerType.default]: infoWidget(),
  [ViewerType.dicom]: dicomViewerWidget(),
  [ViewerType.canvas3d]: canvas3DWidget(),
};

const LABELS: Record<string, string> = {
  [ViewerType.default]: "Info panel",
  [ViewerType.dicom]: "DICOM viewer",
  [ViewerType.canvas3d]: "3D canvas",
};

interface LeftSidebarProps {
  open: boolean;
  theme: Theme;
  handleDrawerClose: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ open, theme, handleDrawerClose }) => {
  const dispatch = useAppDispatch();

  const handleToggle = (checked: boolean, viewer: string) => {
    if (checked) {
      dispatch(addWidget(WIDGETS[viewer]));
    } else {
      dispatch(deleteWidget(viewer));
    }
  };

  return (
    <Drawer
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: theme.spacing(0, 1),
          ...theme.mixins.toolbar,
          justifyContent: "flex-end",
        }}
      >
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ px: "1.5rem" }}>
        <Box sx={{ py: "1.5rem" }}>
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 400,
              color: gray900A,
              marginBottom: "0.75rem",
            }}
          >
            Show / hide viewers
          </Typography>
          <FormGroup
            sx={{
              gap: "0.25rem",
              "& .MuiFormControlLabel-root": { margin: 0, py: "0.5rem" },
            }}
          >
            {Object.keys(WIDGETS).map(viewer => (
              <FormControlLabel
                key={viewer}
                control={
                  <CustomSwitch
                    width={28.8}
                    height={16}
                    thumbDimension={12.8}
                    checkedPosition="translateX(0.8125rem)"
                    onChange={e => handleToggle(e.target.checked, viewer)}
                  />
                }
                label={
                  <Typography color={gray600} variant="subtitle2">
                    {LABELS[viewer]}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </Box>
      </Box>
    </Drawer>
  );
};

export default LeftSidebar;
