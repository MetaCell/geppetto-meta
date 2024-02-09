import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/materialButton';
import { withStyles } from '@mui/material/styles';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = { lightTooltip: { fontSize: 12, }, };

export default withStyles(styles)(({ onClick, tooltip, disabled, className, classes, icon }) => (
  <Tooltip
    title={tooltip}
    placement="left"
    disableFocusListener
    disableTouchListener
    classes={{ tooltip: classes.lightTooltip }}
  >
    <IconButton
      disabled={disabled}
      onClick={event => onClick(event)}
      className={className}
      disableRipple
    >
      <FontAwesomeIcon icon={icon} className={" fa-xs "} />
    </IconButton>
  </Tooltip>
))