import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default ({ onClick, tooltip, disabled, className, icon, style }) => {
  const faicon = icon ? <FontAwesomeIcon icon={icon} className={" fa-xs "} /> : <></>
  return (
    <Tooltip
      title={tooltip}
      placement="left"
      disableFocusListener
      disableTouchListener
      className="geppetto-tooltip"
    >
      <IconButton
        disabled={disabled}
        onClick={onClick}
        className={className}
        disableRipple
        style={style}
      >
        {faicon}
      </IconButton>
    </Tooltip>
  )
}
 