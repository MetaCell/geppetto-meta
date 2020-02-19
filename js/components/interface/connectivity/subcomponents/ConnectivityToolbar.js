import React from 'react';
import AbstractComponent from '../../../AComponent';
import ConnectivityDeck from "./ConnectivityDeck";
import { Matrix } from "../layouts/Matrix";
import { withStyles } from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import MenuButton from "./MenuButton";
import IconButtonWithTooltip from "./IconButtonWithTooltip";


const styles = {

  toolbar: {
    padding: "0",
    marginLeft:"5px"

  },
  toolbarBox: { backgroundColor: "rgb(0,0,0,0.5);", },
  button: {
    padding: "8px",
    top: "0",
    color: "#fc6320"
  },

};

class ConnectivityToolbar extends AbstractComponent {
  constructor (props) {
    super(props);
  }

  /**
   *
   * Updates buttonVisibility true
   *
   * @command onHover (layout)
   *
   */

  render () {
    const {
      id, classes, layout, toolbarVisibility,
      deckHandler, legendHandler, sortOptionsHandler 
    } = this.props;

    const visibility = toolbarVisibility ? "visible" : "hidden";
    let selectButton;
    const sortOptions = {
      'id': 'By entity name',
      'pre_count': 'By # pre',
      'post_count': 'By # post'
    };
    if (layout instanceof Matrix){
      selectButton = (<MenuButton id={id + 'select'}
        options={sortOptions}
        handler = {sortOptionsHandler}
        defaultOption = "id"
        tooltip={"Order by"}
        icon={"fa fa-sort"}
      />)
    }

    let legendsButton = "fa fa-list" ;
    let legendsTooltip = "Toggle legend";
    return (
      <Toolbar className={classes.toolbar}>
        <div className={classes.toolbarBox + " visibility: " + visibility }>
          <ConnectivityDeck ref={ deck => {
            this.deck = deck
          } } handler={deckHandler}/>
          {selectButton}
          <IconButtonWithTooltip
            disabled={false}
            onClick={() => legendHandler()}
            className={ legendsButton + ` ${classes.button} `}
            tooltip={legendsTooltip}
          />
        </div>
      </Toolbar>
    )
  }
}
export default withStyles(styles)(ConnectivityToolbar);