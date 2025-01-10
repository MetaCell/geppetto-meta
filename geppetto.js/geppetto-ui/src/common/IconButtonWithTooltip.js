import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
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
 