import Typography from '@material-ui/core/Typography';
import React, { Component, Fragment } from 'react';

export default class Home extends Component {
  render () {
    return (
      <Fragment>
        <Typography paragraph>
          Skip to the science. The visualisation and simulation platform focused
          on what matters to you.
        </Typography>
        <Typography paragraph>
          Some of the react components responsible for giving you an amazing
          experience.
        </Typography>
      </Fragment>
    );
  }
}
