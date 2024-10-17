import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = { lightTooltip: { fontSize: 12, }, };

export default ({ onClick, tooltip, disabled, icon }) => (
  <Tooltip
    title={tooltip}
    placement="left"
    disableFocusListener
    disableTouchListener
    sx={{ tooltip: styles.lightTooltip }}
  >
    <span>
      <IconButton
        disabled={disabled}
        onClick={event => onClick(event)}
        sx={styles}
        disableRipple
        size="large">
        <FontAwesomeIcon icon={icon} className={" fa-xs "} />
      </IconButton>
    </span>
  </Tooltip>
)