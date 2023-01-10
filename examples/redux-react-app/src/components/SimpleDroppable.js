import React, { memo, useCallback, useMemo } from 'react';
import { Box, Snackbar } from '@material-ui/core';
import { useDrop } from 'react-dnd';
import { updateWidget } from '@metacell/geppetto-meta-client/common/layout/actions';
import { SimpleComponentWidget } from '../widgets';
import { useDispatch } from 'react-redux';

const SimpleDroppable = ({ model, accept }) => {
  const dispatch = useDispatch();

  const watchModel = useMemo(() => model, [model]);

  const onDrop = useCallback(
    item => {
      console.log(item, 'items');

      dispatch(
        updateWidget({
          ...SimpleComponentWidget,
          props: {
            ...SimpleComponentWidget.props,
            model: [...model, item],
          },
        })
      );
    },
    [model, dispatch]
  );

  const checkCanDrop = useCallback(
    item => {
      console.log(
        watchModel.some(ele => ele.id === item.id),
        'candrop'
      );

      return !watchModel.some(ele => ele.id === item.id);
    },
    [watchModel]
  );

  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept,
      canDrop: checkCanDrop,
      drop: onDrop,
      collect: monitor => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [accept, model]
  );

  const isActive = isOver && canDrop;
  const inActive = isOver && !canDrop;
  let backgroundColor = '#222';
  if (isActive) {
    backgroundColor = 'rgba(118, 118, 128, 0.12)';
  } else if (canDrop) {
    backgroundColor = '#1A1A1A';
  }

  return (
    <Box ref={dropRef} style={{ backgroundColor, height: '100%' }}>
      Simple component
      {watchModel && watchModel.length > 0
        ? watchModel.map(ele => <Box key={ele.id}>{ele.name}</Box>)
        : null}
      {inActive && (
        <Snackbar
          autoHideDuration={6000}
          open={inActive}
          message="Model already exist in chart"
        />
      )}
    </Box>
  );
};

export default memo(SimpleDroppable);
