import React from 'react';
import MenuPopper from './MenuPopper';
import Button from '@material-ui/core/Button';

class MenuSection extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      anchorEl: null,
      customList: undefined,
      hover: false,
    };
    this.handleOut = this.handleOut.bind(this);
    this.handleOver = this.handleOver.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleAwayListener = this.handleAwayListener.bind(this);

    this.tempList = undefined;
  }

  handleClick = event => {
    if (this.props.list === undefined || this.props.list.length === 0) {
      if (
        Object.prototype.hasOwnProperty.call(
          this.props.button,
          'dynamicListInjector'
        )
      ) {
        this.tempList = this.props.menuHandlerDirect(
          this.props.button.dynamicListInjector
        );
        const { currentTarget } = event;
        if (this.state.anchorEl !== null) {
          this.props.menuClickHandler(false, undefined);
        } else {
          this.props.menuClickHandler(true, this.props.id);
        }
        this.setState(state => ({
          anchorEl: state.anchorEl ? null : currentTarget,
          customList: this.tempList,
        }));
      } else {
        return;
      }
    } else {
      const { currentTarget } = event;
      if (this.state.anchorEl !== null) {
        this.props.menuClickHandler(false, undefined);
      } else {
        this.props.menuClickHandler(true, this.props.id);
      }
      this.setState(state => ({ anchorEl: state.anchorEl ? null : currentTarget, }));
    }
  };

  handleAwayListener = event => {
    const { currentTarget } = event;
    if (currentTarget.activeElement !== this.state.anchorEl) {
      this.props.menuClickHandler(false, undefined);
      this.setState({ anchorEl: null });
    }
  };

  handleOver = event => {
    const { currentTarget } = event;
    this.setState({ hover: true });
    if (this.props.menuOpen && this.props.sectionOpened !== this.props.id) {
      if (this.props.list === undefined || this.props.list.length === 0) {
        if (
          Object.prototype.hasOwnProperty.call(
            this.props.button,
            'dynamicListInjector'
          )
        ) {
          this.tempList = this.props.menuHandlerDirect(
            this.props.button.dynamicListInjector
          );
        } else {
          return;
        }
      }
      this.setState(
        {
          anchorEl: currentTarget,
          customList: this.tempList,
        },
        () => {
          this.props.menuClickHandler(true, this.props.id);
        }
      );
    }
  };

  handleOut = event => {
    this.setState({ hover: false });
  };

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (
      nextProps.sectionOpened !== this.props.id
      && this.props.menuOpen === true
      && this.state.anchorEl !== null
    ) {
      this.setState({ anchorEl: null });
    }
  }

  render () {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popper' : null;
    const customStyle = this.props.itemOptions;
    let buttonClasses;
    if (open || this.state.hover) {
      buttonClasses = {
        ...this.props.buttonsStyle?.standard,
        ...this.props.button?.style?.standard,
        ...this.props.buttonsStyle?.hover,
        ...this.props.button?.style?.hover,
      };
    } else {
      buttonClasses = {
        ...this.props.buttonsStyle?.standard,
        ...this.props.button?.style?.standard,
      };
    }

    return (
      <span>
        <Button
          style={buttonClasses}
          size="small"
          id={
            typeof this.props.button.label === 'string'
              ? this.props.button.label
              : 'geppetto-menu-btn'
          }
          variant="contained"
          aria-describedby={id}
          onClick={this.handleClick}
          onMouseOver={this.handleOver}
          onMouseOut={this.handleOut}
        >
          { this.props.button.icon !== ""
            ? this.props.button.caret
              ? this.props.button.caret.show
                ? <span style={ { color : this.props.button.activeColor } }>
                  {this.props.button.icon ? this.props.button.icon : null}
                  {this.props.menuOpen ? this.props.button.caret.closedIcon : this.props.button.caret.expandedIcon }
                </span>
                : <span style={{ display: "inline-block", color : this.props.button.activeColor }}>
                  {this.props.button.icon ? this.props.button.icon : null}
                </span>
              : <span style={{ display: "inline-block", color : this.props.button.activeColor }}>
                {this.props.button.icon ? this.props.button.icon : null}
              </span>
            : undefined
          }
          {this.props.button.label}
        </Button>
        <MenuPopper
          parentRef={anchorEl}
          parentHandler={this.handleClick}
          menuList={
            this.props.button.list !== undefined
              ? this.props.button.list
              : this.state.customList
          }
          menuHandler={this.props.menuHandler}
          menuHandlerDirect={this.props.menuHandlerDirect}
          awayClickHandler={this.handleAwayListener}
          position={
            this.props.button.position !== undefined
              ? this.props.button.position
              : 'right'
          }
          drawersStyle={this.props.drawersStyle}
          labelsStyle={this.props.labelsStyle}
          iconStyle={this.props.iconStyle}
          itemOptions={this.props.itemOptions}
        />
      </span>
    );
  }
}

export default MenuSection;
