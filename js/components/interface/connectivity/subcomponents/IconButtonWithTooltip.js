import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';

const styles = { lightTooltip: { fontSize: 12, }, };

export default withStyles(styles)(({ onClick, tooltip, disabled, className, classes, color }) => {
  let content;
  if (disabled) {
    content = <IconButton disabled={!disabled} className={className} />
  } else {
    content = (
      <IconButton
        color={color}
        disabled={disabled}
        onClick={event => onClick(event)}
        className={className}
        disableRipple
      />
    )
  }
  return (
    <Tooltip
      title={tooltip}
      placement="left"
      disableFocusListener
      disableTouchListener
      classes={{ tooltip: classes.lightTooltip }}
    >
      {content}
    </Tooltip>
  )
})