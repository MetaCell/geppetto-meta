import React from 'react';
import AbstractComponent from '../../AComponent';
import { withStyles } from '@material-ui/core';
import ConnectivityToolbar from "./subcomponents/ConnectivityToolbar";
import ConnectivityPlot from "./subcomponents/ConnectivityPlot";
import { Matrix } from "./layouts/Matrix";
import Grid from '@material-ui/core/Grid';


const styles = {
  container: {
    height: '100%',
    minHeight: '100%',
  },
  connectivityContainer: { background: '#424242', },
};

class ConnectivityComponent extends AbstractComponent {
  constructor (props) {
    super(props);
    this.state = {
      layout: this.props.layout !== null ? this.props.layout : new Matrix(),
      toolbarVisibility: true,
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
    this.plotRef.current.blockDraw = false
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
    this.setState(() => ({ layout: layout }));
    this.plotRef.current.blockDraw = false

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
      <div style={{ height:size.height, width:size.width }} onMouseEnter={() => this.toolbarHandler(true)} onMouseLeave={() => this.toolbarHandler(false)}>
        <Grid className={classes.connectivityContainer} container spacing={2}>
          <Grid item sm={12} xs={12} >
            <ConnectivityToolbar
              id={id}
              layout={layout}
              toolbarVisibility={toolbarVisibility}
              legendsVisibility={legendsVisibility}
              legendHandler={this.legendHandler}
              deckHandler={this.deckHandler}
              sortOptionsHandler={this.sortOptionsHandler}
            />
          </Grid>
          <Grid item sm={12} xs>
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
          </Grid>
        </Grid>
      </div>

    )
  }
}
export default withStyles(styles)(ConnectivityComponent);