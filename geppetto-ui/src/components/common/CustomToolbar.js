import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import IconButtonWithTooltip from "./IconButtonWithTooltip";
import Toolbar from "@material-ui/core/Toolbar";

const styles = (theme) => ({
    toolbar: {
        padding: "0",
        marginLeft: "5px"
    },
    button: {
        padding: "8px",
        top: "0",
        color: "#fc6320"
    },
    toolbarBox: {backgroundColor: "rgb(0,0,0,0.5);",},
});


class CustomToolbar extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {classes, buttons, elements} = this.props;
        const customButtons = buttons ? buttons : [];
        const customElements = elements ? elements : [];
        return (
            <div>
                <Toolbar className={classes.toolbar}>
                    <div className={classes.toolbarBox}>
                        {customButtons.map(customButton =>
                            <IconButtonWithTooltip
                                key={customButton.id}
                                disabled={false}
                                onClick={() => customButton.action()}
                                className={classes.button}
                                tooltip={customButton.title}
                                icon={customButton.icon}
                            />
                        )}
                        {customElements.map(customElement =>
                            customElement
                        )}
                    </div>
                </Toolbar>
            </div>
        )
    }
}

export default withStyles(styles, {withTheme: true})(CustomToolbar);