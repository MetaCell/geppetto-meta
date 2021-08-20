import React from 'react';
import { connect } from 'react-redux';
/**
 * Any custom component you can imagine.
 * 
 * This component is referenced in the `app/componentMap.js`.
 */

const FileSelector = (props) => {    
    return (<div>
            <div>{props.visible ? 'visible': 'not-visible'}</div>
          </div>);
}

const mapStateToProps = (state) => {
  const fileSelectorState = state.FileSelector;

  return {
    visible: fileSelectorState.visible    
  }
}

export default connect(mapStateToProps, null)(FileSelector)