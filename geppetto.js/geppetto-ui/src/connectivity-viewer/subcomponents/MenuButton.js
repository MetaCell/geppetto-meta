import React, { Component } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButtonWithTooltip from "../../common/IconButtonWithTooltip";


class MenuButton extends Component {

  constructor (props) {
    super(props);
    this.state = { anchorEl: null };
    this.handleClose = this.handleClose.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }


  handleClose (option) {
    if (option === "") {
      this.setState(() => ({ anchorEl: null }))
    } else {
      this.setState(() => ({ anchorEl: null }), () => this.props.handler(option))

    }
  }

  handleClick (event) {
    this.setState({ anchorEl: event.currentTarget })
  }

  render () {
    const { id, options, defaultOption, tooltip, icon, buttonStyles } = this.props;
    const { anchorEl } = this.state;
    const ITEM_HEIGHT = 48;
    const iconButtonStyles = buttonStyles ? buttonStyles : {}
    return (
      <div>
        <IconButtonWithTooltip
          disabled={false}
          onClick={this.handleClick}
          style={iconButtonStyles}
          tooltip={tooltip}
          icon={icon}
        />
        <Menu
          id={id}
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={() => this.handleClose("")}
          slotProps={{
            paper: {
              style: {
                maxHeight: ITEM_HEIGHT * 4.5,
                width: 200,
              },
            }
          }}
        >
          {Object.keys(options).map(option => (
            <MenuItem key={option} selected={option === defaultOption} onClick={() => this.handleClose(option)}>
              {options[option]}
            </MenuItem>
          ))}
        </Menu>
      </div>
    )

  }
}

export default MenuButton;