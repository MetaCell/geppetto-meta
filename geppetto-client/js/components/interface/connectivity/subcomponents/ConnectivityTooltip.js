import React, {Component} from "react";
import Typography from "@material-ui/core/Typography";
import {withStyles} from "@material-ui/core";

const styles = {
    matrixTooltip: {
        fontSize: "16px",
        fontWeight: "100",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif;",
        color: "white",
        stroke: "none",
        textRendering: "optimizeLegibility",
    },
};


class ConnectivityTooltip extends Component {
    constructor(props) {
        super(props);
        this.state = {layoutTooltip: "Hover the squares to see the connections.",};

    }

    render() {
        const {classes, layout, } = this.props;
        const { layoutTooltip } = this.state;
        const hasTooltip = layout.hasTooltip();

        return (
            <div>
                <Typography className={classes.matrixTooltip} variant="subtitle1" gutterBottom>
                    {hasTooltip ? layoutTooltip : ""}
                </Typography>
            </div>
        )

    }
}

export default withStyles(styles)(ConnectivityTooltip);
