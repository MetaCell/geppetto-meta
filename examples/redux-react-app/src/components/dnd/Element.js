import React, { memo } from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import { useDrag } from 'react-dnd';
import {
  string,
  number,
  arrayOf,
  oneOfType,
  shape,
  objectOf,
} from 'prop-types';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 0.5rem',
    borderRadius: '0.5rem',
    border: '2px solid rgba(242, 242, 242, 1)',
    width: '6.563rem',
    height: '3rem',
    '& .MuiTypography-root': {
      fontSize: '0.875rem',
      lineHeight: '1.5rem',
      letterSpacing: '0.15px',
    },
  },
}));

function Element(props) {
  const classes = useStyles();
  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: props.type,
      item: { ...props },
      collect: monitor => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
      }),
    }),
    [props.type, props.name]
  );
  return (
    <Box ref={dragRef} className={classes.root} data-testid="droppable-chart">
      <DragIndicatorIcon fontSize="small" />
      <Typography noWrap>{props.name}</Typography>
    </Box>
  );
}

export default memo(Element);

Element.propTypes = {
  id: string.isRequired, // required property
  name: string,
  type: string.isRequired,
};
