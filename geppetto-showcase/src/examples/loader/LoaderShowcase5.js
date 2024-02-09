import React, { Component } from 'react';
import Loader from '@metacell/geppetto-meta-ui/loader/Loader';
import Button from '@mui/material';

export default class LoaderShowcase4 extends Component {
  constructor (props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.state = { active: false, };
  }

  handleClose () {
    const { active } = this.state;
    this.setState({ active: !active });
  }

  handleToggle () {
    const { active } = this.state;
    this.setState({ active: !active });
  }

  render () {
    const { active } = this.state;

    return (
      <div>
        <Button variant="outlined" color="primary" onClick={this.handleToggle}>
          Show Loader
        </Button>
        <Loader active={active} handleClose={this.handleClose}>
          My content
        </Loader>
      </div>
    );
  }
}
