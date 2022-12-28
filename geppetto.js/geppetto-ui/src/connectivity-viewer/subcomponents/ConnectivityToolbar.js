import React, { Component } from 'react';
import ConnectivityDeck from "./ConnectivityDeck";
import MenuButton from "./MenuButton";
import { faList, faSort } from "@fortawesome/free-solid-svg-icons";
import CustomToolbar from "../../common/CustomToolbar";

const LEGENDS_TOOLTIP = "Toggle legend"

export default class ConnectivityToolbar extends Component {
  constructor (props) {
    super(props);
  }

  getCustomButtons () {
    const customButtons = [];
    if (this.props.layout.hasToggle()) {
      customButtons.push({
        'icon': faList,
        'id': 'legendButton',
        'tooltip': LEGENDS_TOOLTIP,
        'action': () => this.props.legendHandler()
      });
      return customButtons;
    }
  }

  getCustomElements () {
    const { id, deckHandler, layout, sortOptionsHandler, options } = this.props;

    const {menuButtonStyles, deckStyles} = options

    const sortOptions = {
      'id': 'By entity name',
      'pre_count': 'By # pre',
      'post_count': 'By # post'
    };

    const deck = (<ConnectivityDeck
      key={id + '_deck'}
      id={id + '_deck'}
      ref={ deck => {
        this.deck = deck
      } }
      handler={deckHandler}
      styles={deckStyles}
    />)
    const customElements = [deck];

    if (layout.hasSelect()) {
      customElements.push((
        <MenuButton
          key={id + '_select'}
          id={id + '_select'}
          options={sortOptions}
          handler = {sortOptionsHandler}
          defaultOption = "id"
          tooltip={"Order by"}
          icon={faSort}
          buttonStyles={menuButtonStyles}
        />));
    }
    return customElements;
  }

  render () {
    const { toolbarVisibility, options } = this.props;
    const visibility = toolbarVisibility ? "visible" : "hidden";

    const customElements = this.getCustomElements();
    const customButtons = this.getCustomButtons();

    const toolbar = options && options.instance ? (
        <options.instance
            buttons={customButtons}
            {...options.props}
        />
    ) : <CustomToolbar buttons={customButtons} elements={customElements}
                       containerStyles={options?.containerStyles}
                       toolBarClassName={options?.toolBarClassName}
                       innerDivStyles={options?.innerDivStyles}
                       buttonStyles={options?.buttonStyles}/>;

    return (
      <span style={{ visibility: visibility }}>
        {toolbar}
      </span>
    )
  }
}