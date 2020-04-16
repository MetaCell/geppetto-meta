import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { withStyles } from '@material-ui/core';

const styles = (theme) => ({
  htmlViewer: {
    outline: "none",
    fontSize: "14px",
    fontWeight: 200,
    color: "white",
    overflow: "auto !important",
    userSelect: "text"
  },
})

class HTMLViewer extends Component {

  constructor(props) {
    super(props);

    this.state = { content: this.props.content, };
    this.handleClick = this.handleClick.bind(this);
    this.htmlViewer = React.createRef();

  }

  setContent(content) {
    this.setState({ content });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.content != this.props.content) {
      this.setState({ content: nextProps.content });
    }
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
    const { classes } = this.props;
    return (
      <div key={this.props.id + "_component"} id={this.props.id + "_component"} className={classes.htmlViewer} ref={this.htmlViewer} style={this.props.style}>
        <div dangerouslySetInnerHTML={{ __html: this.state.content }} onClick={this.handleClick}></div>
      </div>
    )
  }
};
export default withStyles(styles)(HTMLViewer);
