import type React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useStore, useSelector } from 'react-redux';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  InputLabel,
  MenuItem,
  FormControl
} from "@mui/material"
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityOnIcon from '@mui/icons-material/Visibility';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { getLayoutManagerInstance } from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
import { addWidget, updateWidget } from '@metacell/geppetto-meta-client/common/layout/actions';
import { type Widget, WidgetStatus } from "@metacell/geppetto-meta-client/common/layout/model";
import '@metacell/geppetto-meta-ui/flex-layout/style/dark.scss'

import { componentWidget } from "../widgets";

const HomePage = () => {
  const store = useStore();
  const dispatch = useDispatch();
  // @ts-expect-error The type checker do not know here about "widget", a better type annotation for "state" is required
  const widgets = useSelector(state => state.widgets);
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const [LayoutComponent, setLayoutComponent] = useState<any | undefined>(undefined);
  const [panel, setPanel] = useState("topLeft");
  const [name, setName] = useState("Component 1");
  const [color, setColor] = useState("red");
  
  useEffect(() => {
    if (LayoutComponent === undefined) {
      const myManager = getLayoutManagerInstance();
      if (myManager) {
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        setLayoutComponent(myManager.getComponent() as React.ComponentType<any>);
      }
    }
  }, [store, LayoutComponent])
  
  const addComponent = () => {
    dispatch(addWidget(componentWidget(name, color, panel)));
  };
  
  
  const activateWidget = (widget: Widget) => {
    const updatedWidget = { ...widget };
    updatedWidget.status = WidgetStatus.ACTIVE;
    updatedWidget.panelName = panel;
    dispatch(updateWidget(updatedWidget));
  };
  
  
  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{
        width: '100%',
        display: 'flex',
        padding: 2
      }}>
        <TextField id="outlined-basic" label="Name" variant="outlined" value={name} onChange={(event) =>
          setName(event.target.value as string)
        }/>
        <FormControl>
          <InputLabel id="name">Panel</InputLabel>
          <Select
            labelId="panel"
            value={panel}
            label="Panel"
            onChange={(event: SelectChangeEvent) =>
              setPanel(event.target.value as string)
            }
          >
            <MenuItem value={"topLeft"}>Top Left</MenuItem>
            <MenuItem value={"topRight"}>Top Right</MenuItem>
            <MenuItem value={"bottom"}>Bottom</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="name">Color</InputLabel>
          <Select
            labelId="color"
            value={color}
            label="Color"
            onChange={(event: SelectChangeEvent) =>
              setColor(event.target.value as string)
            }
          >
            <MenuItem value={"red"}>Red</MenuItem>
            <MenuItem value={"green"}>Green</MenuItem>
            <MenuItem value={"blue"}>Blue</MenuItem>
            <MenuItem value={"orange"}>Orange</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={addComponent}>
          Add Component
        </Button>
        
        {Object.values(widgets).map((widget: Widget, index: number) => (
          <Tooltip key={index} title={widget.name}>
            <IconButton onClick={() => activateWidget(widget)} disabled={widget.status === WidgetStatus.ACTIVE}>
              {widget.status == WidgetStatus.ACTIVE ? <VisibilityOffIcon/> : <VisibilityOnIcon/>}
            </IconButton>
          </Tooltip>
        ))}
      
      </Stack>
      <Box p={2} sx={{
        display: 'flex',
        position: 'relative',
        width: '100%',
        height: '90vh',
      }}>
        {LayoutComponent === undefined ? <CircularProgress/> : <LayoutComponent/>}
      </Box>
    </Box>
  );
}

export default HomePage;