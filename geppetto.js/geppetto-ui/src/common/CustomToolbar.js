import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import IconButtonWithTooltip from "./IconButtonWithTooltip";
import Toolbar from "@material-ui/core/Toolbar";

const styles = theme => ({
  toolbar: {
    padding: theme.spacing(0),
    marginLeft: theme.spacing(1)
  }
});


class CustomToolbar extends Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { classes, theme, buttons, elements, containerStyles, toolBarClassName, innerDivStyles, buttonStyles } = this.props;
    const customButtons = buttons ? buttons : [];
    const customElements = elements ? elements : [];
    const cStyles = containerStyles != null ? containerStyles : {}
    const tbClassName = toolBarClassName != null ? toolBarClassName : classes.toolbar
    const dStyles = innerDivStyles != null ? innerDivStyles : { backgroundColor: 'rgb(0,0,0,0.5)' }
    const bStyles = buttonStyles != null ? buttonStyles : {
      padding: theme.spacing(1),
      top: theme.spacing(0),
      color: '#fc6320'
    }
    return (
      <div style={cStyles}>
        <Toolbar className={tbClassName}>
          <div style={dStyles}>
            {customButtons.map(customButton =>
              <IconButtonWithTooltip
                key={customButton.id}
                disabled={false}
                onClick={() => customButton.action()}
                className={classes.button}
                style={bStyles}
                tooltip={customButton.tooltip}
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

export default withStyles(styles, { withTheme: true })(CustomToolbar);