import React from 'react';
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Drawer from "@mui/material/Drawer";
import { useDispatch } from "react-redux";
import { addWidget } from "@metacell/geppetto-meta-client/common/layout/actions";
import { MyComponentWidget } from '../widgets';
import { Theme } from '@mui/material/styles';

const drawerWidth = 240;

interface LeftSidebarProps {
  handleDrawerClose: () => void;
  theme: Theme;
  open: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ handleDrawerClose, theme, open }) => {
  const dispatch = useDispatch();
  
  const onCustomWidgetClick = () => {
    // @ts-ignore
    dispatch(addWidget(MyComponentWidget));
  };
  
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(0, 1),
          ...theme.mixins.toolbar,
          justifyContent: 'flex-end',
        }}
      >
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List>
        {['Add Widget', 'Remove Widget', 'Maximize Widget', 'Minimize Widget', 'Activate Widget', 'Update Widget'].map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={onCustomWidgetClick}>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['Add Image Viewer', 'Remove Image Viewer'].map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['Add DICOM Viewer', 'Remove DICOM Viewer'].map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['Add Canvas', 'Remove Canvas'].map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['Load', 'Change layout'].map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default LeftSidebar;
