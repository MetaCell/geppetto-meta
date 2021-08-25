import React from 'react';

const CanvasToolTip = (props) => {
  return <div id={props.id} style={{ position: 'fixed',
                                    left: props.x,
                                    top: props.y,
                                    minWidth: '100px',
                                    textAlign: 'center',
                                    padding: '5px 12px',
                                    fontFamily: 'monospace',
                                    background: '#a0c020',
                                    display: 'block',
                                    opacity: '1',
                                    border: '1px solid black',
                                    boxShadow: '2px 2px 3px rgba(0, 0, 0, 0.5)',
                                    transition: 'opacity 0.25s linear',
                                    borderRadius: '3px' }}>{props.text}</div>
}

export default CanvasToolTip;