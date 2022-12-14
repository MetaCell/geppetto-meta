import React, { memo, useMemo } from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import { useDrag } from 'react-dnd';
import { string } from 'prop-types';

const useStyles = makeStyles(() => ({
  root: props => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 0.5rem',
    borderRadius: '0.5rem',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'rgba(242, 242, 242, 1)',
    width: '6.563rem',
    height: '3rem',
    '& .MuiTypography-root': {
      fontSize: '0.875rem',
      lineHeight: '1.5rem',
      letterSpacing: '0.15px',
    },
  }),
  preview: {
    width: '6.563rem',
    height: '3rem',
    borderRadius: '0.5rem',
    backgroundColor: 'rgba(242, 242, 242, 1)',
    border: '2px solid rgba(242, 242, 242, 1)',
  },
}));

function Element(props) {
  const [{ opacity, isDragging }, dragRef, dragPreview] = useDrag(
    () => ({
      type: props.type,
      item: { ...props },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
        opacity: monitor.isDragging() ? 0.4 : 1,
      }),
    }),
    [props.type, props.name]
  );
  const classes = useStyles();

  return isDragging ? (
    <Box
      ref={dragPreview}
      className={classes.preview}
      style={{ opacity }}
    ></Box>
  ) : (
    <Box ref={dragRef} className={classes.root} data-testid="droppable-chart">
      <DragIndicatorIcon fontSize="small" style={{ cursor: 'grab' }} />
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
