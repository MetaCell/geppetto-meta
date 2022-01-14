import React from 'react';

const CanvasToolTip = React.forwardRef((props, ref) => {

  const [intersected, setIntersected] = React.useState(null);
  const [tooltipVisible, setTooltipVisible] = React.useState(false);

  React.useImperativeHandle(
    ref,
    () => ({
      updateIntersected(updatedIntersection) {
        setIntersected(updatedIntersection);

        setTooltipVisible(true);

        setTimeout(() => {
            setTooltipVisible(false);
        }, 1500);
      }
    })
  )
  return (
    <> 
      {intersected && intersected.o
        && (
          <div
            id={`canvas-tooltip-${intersected?.o?.object.uuid}`}
            style={{
              position: 'fixed',
              left: intersected?.x,
              top: intersected?.y,
              zIndex: 9999,
              minWidth: '100px',
              textAlign: 'center',
              padding: '5px 12px',
              fontFamily: 'monospace',
              background: '#a0c020',
              display: tooltipVisible ? 'block' : 'none',
              opacity: '1',
              border: '1px solid black',
              boxShadow: '2px 2px 3px rgba(0, 0, 0, 0.5)',
              transition: 'opacity 0.25s linear',
              borderRadius: '3px',
            }}
          >
            {intersected?.o?.object.uuid}
          </div>
        )}
    </>
  )
});

export default CanvasToolTip;