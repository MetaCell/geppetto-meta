import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButtonWithTooltip from "./IconButtonWithTooltip";

const styles = () => ({
  button: {
    padding: "8px",
    top: "0",
    color: "#fc6320"
  },
});

class MenuButton extends Component {

  constructor (props) {
    super(props);
    this.state = { anchorEl: null };
    this.handleClose = this.handleClose.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }


  handleClose (option) {
    if (option === ""){
      this.setState(() => ({ anchorEl: null }))
    } else {
      this.setState(() => ({ anchorEl: null }), () => this.props.handler(option))

    }
  }

  handleClick (event) {
    this.setState({ anchorEl: event.currentTarget })
  }

  render () {
    const { id, options, classes, defaultOption, tooltip, icon } = this.props;
    const { anchorEl } = this.state;
    const ITEM_HEIGHT = 48;
    return (
      <span>
        <IconButtonWithTooltip
          disabled={false}
          onClick={this.handleClick}
          className={`${icon} ${classes.button}`}
          tooltip={tooltip}
        />
        <Menu
          id={id}
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={() => this.handleClose("")}
          PaperProps={{
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: 200,
            },
          }}
        >
          {Object.keys(options).map(option => (
            <MenuItem key={option} selected={option === defaultOption} onClick={() => this.handleClose(option)}>
              {options[option]}
            </MenuItem>
          ))}
        </Menu>
      </span>
    )

  }
}

export default withStyles(styles)(MenuButton);