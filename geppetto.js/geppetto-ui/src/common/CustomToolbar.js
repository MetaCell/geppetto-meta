import React, { Component } from "react";
import IconButtonWithTooltip from "./IconButtonWithTooltip";
import Toolbar from "@mui/material/Toolbar";

const defaultButtonColor = '#fc6320'
const defaultBackgroundColor = 'rgb(0,0,0,0.5)'

const defaultStyles = {
  toolbar: {
    padding: 0,
    marginLeft: "0.25rem"
  },
  button: {
    padding: "0.25rem",
    top: 0,
    color: defaultButtonColor
  }
};


class CustomToolbar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { buttons, elements, containerStyles, toolbarClassName, toolbarStyles, innerDivStyles } = this.props;

    const customButtons = buttons ? buttons : [];
    const customElements = elements ? elements : [];
    const cStyles = containerStyles != null ? containerStyles : {}
    const tbStyles = toolbarStyles != null ? toolbarStyles : defaultStyles.toolbar
    const dStyles = innerDivStyles != null ? innerDivStyles : { backgroundColor: defaultBackgroundColor }
    
    return (
      <div style={cStyles}>
        <Toolbar styles={tbStyles} className={toolbarClassName}>
          <div style={dStyles}>
            {customButtons.map(customButton =>
              <ButtonComponent
                key={customButton.id}
                disabled={false}
                onClick={() => customButton.action()}
                className={classes.button}
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

export default CustomToolbar;