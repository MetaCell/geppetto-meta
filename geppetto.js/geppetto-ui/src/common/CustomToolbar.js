import React, { Component } from "react";
import IconButtonWithTooltip from "./IconButtonWithTooltip";

import "./style.css";

class CustomToolbar extends Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { buttons, elements } = this.props;

    const customButtons = buttons ? buttons : [];
    const customElements = elements ? elements : [];

    return (
      <nav className="geppetto-toolbar">
        {customButtons.map(customButton =>
          <IconButtonWithTooltip
            key={customButton.id}
            disabled={false}
            onClick={() => customButton.action()}
            className="geppetto-toolbar-button"
            tooltip={customButton.tooltip}
            icon={customButton.icon}
          />
        )}
        {customElements.map(customElement =>
          <div key={customElement.key} className="geppetto-toolbar-button">
            {customElement}
          </div>
        )}
      </nav>
    )
  }
}

export default CustomToolbar;