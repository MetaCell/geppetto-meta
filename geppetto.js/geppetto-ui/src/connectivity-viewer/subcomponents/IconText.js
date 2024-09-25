import React from 'react';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';

const classes = {
  legend: "icon-text-legend",
  gridWrapper: "icon-text-grid",
};

export default ({ icon, subtitle, color, width, height }) => (
  <div className={classes.gridWrapper}>
    <Icon className={icon} style={{ background: color, width: width, height: height }} />
    <Typography className={classes.legend} variant="subtitle1" gutterBottom>
      {subtitle}
    </Typography>
  </div>
)