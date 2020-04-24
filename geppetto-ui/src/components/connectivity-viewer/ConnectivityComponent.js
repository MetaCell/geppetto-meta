import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import ConnectivityToolbar from './subcomponents/ConnectivityToolbar';
import ConnectivityPlot from './subcomponents/ConnectivityPlot';
import { Matrix } from './layouts/Matrix';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';

const styles = (theme) => ({
  container: {
    height: '100%',
    width: '100%',
  },
});

class ConnectivityComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layout: this.props.layout !== null ? this.props.layout : new Matrix(),
      toolbarVisibility: true,
      legendsVisibility: true,
      dimensions: null,
    };
    this.legendHandler = this.legendHandler.bind(this);
    this.deckHandler = this.deckHandler.bind(this);
    this.sortOptionsHandler = this.sortOptionsHandler.bind(this);
    this.plotRef = React.createRef();
    this.containerRef = React.createRef();
  }

  /**
   *
   * Handles legend toggle button
   *
   * @command legendHandler ()
   *
   */
  legendHandler() {
    this.setState(() => ({ legendsVisibility: !this.state.legendsVisibility }));
  }

  /**
   *
   * Handles toolbar visibility
   *
   * @command toolbarHandler (visibility)
   *
   */

  toolbarHandler(visibility) {
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
  deckHandler(layout) {
    this.setState(() => ({ layout: layout }));
  }

  /**
   *
   * Updates the sorting order
   *
   * @command sortOptionsHandler (option)
   *
   */
  sortOptionsHandler(option) {
    this.state.layout.setOrder(this.plotRef.current, option);
  }

  componentDidMount() {
    const toolbarHeight = 140;

    this.setState({
      dimensions: {
        width: this.containerRef.current.clientWidth,
        height: this.containerRef.current.clientHeight - toolbarHeight,
      },
    });
  }

  renderContent() {
    const {
      id,
      data,
      colorMap,
      colors,
      names,
      modelFactory,
      resources,
      matrixOnClickHandler,
      nodeType,
      linkWeight,
      linkType,
      library,
    } = this.props;
    const {
      layout,
      toolbarVisibility,
      legendsVisibility,
      dimensions,
    } = this.state;

    return (
      <Grid container spacing={2}>
        <Grid item sm={12} xs={12}>
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
            ref={this.plotRef}
            id={id}
            size={dimensions}
            data={data}
            colorMap={colorMap}
            colors={colors}
            names={names}
            layout={layout}
            legendsVisibility={legendsVisibility}
            toolbarVisibility={toolbarVisibility}
            modelFactory={modelFactory}
            resources={resources}
            matrixOnClickHandler={matrixOnClickHandler}
            nodeType={nodeType}
            linkWeight={linkWeight}
            linkType={linkType}
            library={library}
          />
        </Grid>
      </Grid>
    );
  }

  render() {
    const { classes } = this.props;
    const { dimensions } = this.state;

    const content = dimensions != null ? this.renderContent() : '';
    return (
      <div
        ref={this.containerRef}
        className={classes.container}
        onMouseEnter={() => this.toolbarHandler(true)}
        onMouseLeave={() => this.toolbarHandler(false)}
      >
        {content}
      </div>
    );
  }
}

ConnectivityComponent.propTypes = {
  /**
   * Description of prop id.
   */
  id: PropTypes.string.isRequired,
  /**
   * Description of prop colors.
   */
  colors: PropTypes.array.isRequired,
  /**
   * Description of prop data.
   */
  data: PropTypes.object.isRequired,
  /**
   * Description of prop modelFactory.
   */
  modelFactory: PropTypes.object.isRequired,
  /**
   * Description of prop resources.
   */
  resources: PropTypes.object.isRequired,
  /**
   * Description of prop matrixOnClickHandler.
   */
  matrixOnClickHandler: PropTypes.func.isRequired,
  /**
   * Description of prop colorMap.
   */
  colorMap: PropTypes.func,
  /**
   * Description of prop layout.
   */
  layout: PropTypes.object,
  /**
   * Description of prop linkType.
   */
  linkType: PropTypes.func,
  /**
   * Description of prop linkWeight.
   */
  linkWeight: PropTypes.func,
  /**
   * Description of prop nodeType.
   */
  nodeType: PropTypes.func,
  /**
   * Description of prop library.
   */
  library: PropTypes.func,
};

export default withStyles(styles)(ConnectivityComponent);
