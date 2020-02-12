import React from 'react';
import AbstractComponent from '../../AComponent';
import { withStyles } from '@material-ui/core';
import ConnectivityToolbar from "./subcomponents/ConnectivityToolbar";
import ConnectivityPlot from "./subcomponents/ConnectivityPlot";
import { Matrix } from "./layouts/Matrix";


const styles = {
  container: {
    height: '100%',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column' 
  },
  connectivityContainer: {
    background: '#424242',
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    flex: "1"
  },
};

class ConnectivityComponent extends AbstractComponent {
  constructor (props) {
    super(props);
    this.state = {
      layout: this.props.layout !== null ? this.props.layout : new Matrix(),
      toolbarVisibility: false,
      legendsVisibility: true,
    };
    this.legendHandler = this.legendHandler.bind(this);
    this.deckHandler = this.deckHandler.bind(this);
    this.sortOptionsHandler = this.sortOptionsHandler.bind(this);
    this.plotRef = React.createRef();

  }

  /**
   *
   * Handles legend toggle button
   *
   * @command legendHandler ()
   *
   */
  legendHandler () {
    this.setState(() => ({ legendsVisibility: !this.state.legendsVisibility }));
  }

  /**
   *
   * Handles toolbar visibility
   *
   * @command toolbarHandler (visibility)
   *
   */
  toolbarHandler (visibility) {
    this.setState(() => ({ toolbarVisibility: visibility }));
  }

  /**
   *
   * Handle layout selection
   *
   * @command deckHandler (layout)
   *
   * @param layout
   */
  deckHandler (layout) {
    this.setState(() => ({ layout: layout }))
  }

  /**
   *
   * Updates the sorting order
   *
   * @command sortOptionsHandler (option)
   *
   */
  sortOptionsHandler (option){
    this.state.layout.setOrder(this.plotRef.current, option);
  }

  render () {
    const { classes, id, size, data, options, colorMap, colors, names } = this.props;
    const { layout, toolbarVisibility, legendsVisibility } = this.state;

    return (
      <div className={classes.container} onMouseEnter={() => this.toolbarHandler(true)} onMouseLeave={() => this.toolbarHandler(false)}>
        <div className={classes.connectivityContainer}>
          <ConnectivityToolbar
            id={id}
            layout={layout}
            toolbarVisibility={toolbarVisibility}
            legendsVisibility={legendsVisibility}
            legendHandler={this.legendHandler}
            deckHandler={this.deckHandler}
            sortOptionsHandler={this.sortOptionsHandler}
          />
          <ConnectivityPlot
            ref = {this.plotRef}
            id={id}
            size={size}
            data={data}
            options={options}
            colorMap={colorMap}
            colors={colors}
            names={names}
            layout={layout}
            legendsVisibility={legendsVisibility}
            toolbarVisibility={toolbarVisibility}
          />
        </div>
      </div>

    )
  }
}
export default withStyles(styles)(ConnectivityComponent);