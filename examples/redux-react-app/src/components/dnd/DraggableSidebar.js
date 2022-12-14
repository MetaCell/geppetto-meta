import { Box, Drawer, Grid, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { mockELements } from './data';
import Element from './Element';

const useStyles = makeStyles(theme => ({
  drawer: {
    width: theme.drawer.width,
  },
  drawerContent: {
    width: theme.drawer.width,
    paddingTop: theme.spacing(10),
  },
  buttonGroup: {
    margin: theme.spacing(1),
  },
}));

const DraggableSidebar = props => {
  const classes = useStyles();
  return (
    <>
      <Drawer className={classes.drawer} variant="permanent" anchor="right">
        <div className={classes.drawerContent}>
          <Typography>Draggable</Typography>
          <Box>
            <Typography>Component</Typography>
            <Grid container justifyContent="center" spacing={2}>
              {mockELements.map(({ id, name, type }) => (
                <Grid key={id} item>
                  <Element key={id} id={id} name={name} type={type} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </div>
      </Drawer>
    </>
  );
};

export default DraggableSidebar;
