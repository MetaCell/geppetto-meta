import React from 'react';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  legend: {
    fontSize: "12px",
    fontWeight: "100",
    color: "white",
    display: "inline-block",
    marginLeft: "5px",
    position: "relative",
    top: "-5px",
  }
};

export default withStyles(styles)(({ icon, subtitle, color, width, height, classes }) => (
  <div>
    <Icon className={icon} style={{ background: color, width: width, height: height }} />
    <Typography className={classes.legend} variant="subtitle1" gutterBottom>
      {subtitle}
    </Typography>
  </div>
))