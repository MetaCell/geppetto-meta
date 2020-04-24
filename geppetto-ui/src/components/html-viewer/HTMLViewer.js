import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';

const styles = () => ({
  htmlViewer: {
    outline: 'none',
    fontSize: '14px',
    fontWeight: 200,
    color: 'white',
    overflow: 'auto !important',
    userSelect: 'text',
  },
});

class HTMLViewer extends Component {
  constructor(props) {
    super(props);

    this.state = { content: this.props.content };
    this.handleClick = this.handleClick.bind(this);
    this.htmlViewer = React.createRef();
  }

  setContent(content) {
    this.setState({ content });
  }

  componentDidMount() {
    const element = ReactDOM.findDOMNode(this.htmlViewer.current);
    element.setAttribute('tabIndex', -1);
  }

  handleClick(e) {
    const element = e.target;
    if (element.matches('a') && element.dataset) {
      this.props.handleClick(element, element.dataset);
    }
  }

  render() {
    const { classes, content } = this.props;
    return (
      <div
        className={classes.htmlViewer}
        ref={this.htmlViewer}
        style={this.props.style}
      >
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          onClick={this.handleClick}
        ></div>
      </div>
    );
  }
}

HTMLViewer.propTypes = {
  /**
   * Description of prop content.
   */
  content: PropTypes.string.isRequired,
  /**
   * Description of prop colors.
   */
  style: PropTypes.object.isRequired,
};

export default withStyles(styles)(HTMLViewer);
