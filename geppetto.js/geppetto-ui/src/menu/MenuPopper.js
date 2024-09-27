import React from 'react';
import MenuSingleItem from './MenuSingleItem';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuList from '@mui/material/MenuList';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { Box } from '@mui/material';

class MenuPopper extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const anchorEl = this.props.parentRef;
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popper' : null;

    if (anchorEl !== undefined || anchorEl !== null) {
      return (<Popper id={id} open={open} anchorEl={anchorEl} placement={String((this.props.position !== undefined) ? this.props.position : "right-start")} transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={50}>
            <Box>
              <ClickAwayListener onClickAway={this.props.awayClickHandler}>
                <Paper
                  style={this.props.drawersStyle.standard}
                  square={false}>
                  <MenuList>
                    <MenuSingleItem
                      position={this.props.position}
                      parentRef={anchorEl}
                      menuList={this.props.menuList}
                      menuHandler={this.props.menuHandler}
                      menuHandlerDirect={this.props.menuHandlerDirect}
                      awayClickHandler={this.props.awayClickHandler}
                      drawersStyle={this.props.drawersStyle}
                      labelsStyle={this.props.labelsStyle}
                      iconStyle={this.props.iconStyle}
                      {...this.props.itemOptions}
                    />
                  </MenuList>
                </Paper>
              </ClickAwayListener>
            </Box>
          </Fade>
        )}
      </Popper>);
    } else {
      return (
        <span></span>
      );
    }
  }
}

export default MenuPopper;
