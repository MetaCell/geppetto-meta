import React, { Component } from 'react';

export default class CanvasTooltip extends Component {

  tooltipStyle = null ;

  constructor (props) { 
    super(props);
    if (props.visible) {
      this.state = {
        position: 'fixed',
        left: props.x,
        top: props.y,
        minWidth: '100px',
        textAlign: 'center',
        padding: '5px 12px',
        fontFamily: 'monospace',
        background: '#a0c020',
        display: 'block',
        opacity: '0',
        border: '1px solid black',
        boxShadow: '2px 2px 3px rgba(0, 0, 0, 0.5)',
        transition: 'opacity 0.25s linear',
        borderRadius: '3px',
        text: props.text
      }
    }
    else {
      this.state = { display : 'none' }
    }
  }

  render() {
    return <div id={props.id} className={this.state}></div>
  }
}