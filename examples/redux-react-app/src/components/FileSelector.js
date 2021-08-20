import React from 'react';
import { connect } from 'react-redux';
/**
 * Any custom component you can imagine.
 * 
 * This component is referenced in the `app/componentMap.js`.
 */

export const FileSelector = (props) => {    
    return (
      <div>
        <div>{props.visible ? 'visible': 'not-visible'}</div>
      </div>
    )
}

function mapStateToProps(state) {
  return { visible: state.FileSelectorState.visible }
}

export default connect(mapStateToProps, null)(FileSelector)