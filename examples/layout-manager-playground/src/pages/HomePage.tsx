import React, { useEffect, useState } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { Box, Button, CircularProgress, Stack, TextField } from "@mui/material"
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
// @ts-ignore
import { getLayoutManagerInstance } from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
// @ts-ignore
import { addWidget } from '@metacell/geppetto-meta-client/common/layout/actions';
import '@metacell/geppetto-meta-ui/flex-layout/style/dark.scss'

import { componentWidget } from "../widgets";

const HomePage = () => {
  const store = useStore();
  const dispatch = useDispatch();
  const [LayoutComponent, setLayoutComponent] = useState<any | undefined>(undefined);
  const [panel, setPanel] = useState("topLeft");
  const [name, setName] = useState("Component 1");
  const [color, setColor] = useState("red");
  useEffect(() => {
    if (LayoutComponent === undefined) {
      const myManager = getLayoutManagerInstance();
      if (myManager) {
        myManager.enableMinimize = true
        setLayoutComponent(myManager.getComponent() as React.ComponentType<any>);
      }
    }
  }, [store])

  const addComponent = () => {
    dispatch(addWidget(componentWidget(name, color, panel)));
  };


  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{
        width: '100%',
        display: 'flex',
        padding: 2
      }}>
        <TextField id="outlined-basic" label="Name" variant="outlined" value={name}  onChange={(event: any) => 
          setName(event.target.value as string)
        } />
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

      </Stack>
      <Box sx={{
        display: 'flex',
        position: 'relative',
        width: '100%',
        height: '96vh',
      }}>
        {LayoutComponent === undefined ? <CircularProgress/> : <LayoutComponent/>}
      </Box>
    </Box>
  );
}

export default HomePage;