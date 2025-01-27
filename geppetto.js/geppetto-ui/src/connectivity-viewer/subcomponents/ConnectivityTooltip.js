import React, { Component } from "react";
import Typography from "@mui/material/Typography";


const classes = { matrixTooltip: "connectivity-tooltip-matrix" };

const LAYOUT_TOOLTIP = "Hover the squares to see the connections."

class ConnectivityTooltip extends Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { layout, } = this.props;
    const hasTooltip = layout.hasTooltip();

    return (
      <div>
        <Typography className={classes.matrixTooltip} variant="subtitle1" gutterBottom>
          {hasTooltip ? LAYOUT_TOOLTIP : ""}
        </Typography>
      </div>
    )

  }
}

export default ConnectivityTooltip;
