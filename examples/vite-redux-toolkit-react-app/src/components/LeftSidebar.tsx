import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import { Theme } from "@mui/material/styles";
import {addWidget, deleteWidget} from "@metacell/geppetto-meta-client/common/layout/actions";
import {
  componentWidget, DicomViewerWidget,
} from "../layoutManager/widgets.ts";
import { useDispatch } from "react-redux";
import { FormControlLabel, FormGroup } from "@mui/material";
import Typography from "@mui/material/Typography";
import CustomSwitch from "./CustomSwitch.tsx";
import { vars } from "../theme/variables.ts";
import { ViewerType } from "../models";
const { gray600, gray900A } = vars;

const drawerWidth = 240;

const viewers = {
  [ViewerType.default]: componentWidget(),
  [ViewerType.dicomViewer]: DicomViewerWidget(),
};

interface LeftSidebarProps {
  handleDrawerClose: () => void;
  theme: Theme;
  open: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  handleDrawerClose,
  theme,
  open,
}) => {
  const dispatch = useDispatch();
  const handleToggle = (e, viewer) => {
    if (e.target.checked) {
      dispatch(addWidget(viewers[viewer]))
    } else {
      dispatch(deleteWidget(viewer))
    }
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
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
          {theme.direction === "ltr" ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
      </Box>
      <Divider />
      <Box px="1.5rem">
        <Box py="1.5rem">
          <Typography
            sx={{
              fontSize: "1rem",
              lineHeight: "142.857%",
              fontWeight: 400,
              color: gray900A,
              marginBottom: "0.75rem",
            }}
          >
            Show/hide viewers
          </Typography>
          <FormGroup
            sx={{
              gap: "0.25rem",
              "& .MuiFormControlLabel-root": {
                margin: 0,
                py: "0.5rem",
              },
              "& .MuiTypography-root": {
                color: gray600,
              },
            }}
          >
            {Object.keys(viewers).map((viewer) => (
              <FormControlLabel
                control={
                  <CustomSwitch
                    width={28.8}
                    height={16}
                    thumbDimension={12.8}
                    checkedPosition="translateX(0.8125rem)"
                    onChange={(e) => handleToggle(e, viewer)}
                  />
                }
                key={viewer}
                label={
                  <Typography color={gray600} variant="subtitle1">
                    {viewer}
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
