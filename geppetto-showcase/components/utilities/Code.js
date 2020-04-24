import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import IconButtonWithTooltip from './IconButtonWithTooltip';
import { faCode, faEdit, faCopy } from '@fortawesome/free-solid-svg-icons';
import Toolbar from '@material-ui/core/Toolbar';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const styles = (theme) => ({
  toolbar: {
    padding: theme.spacing(0),
    marginLeft: theme.spacing(1),
  },
  button: {
    padding: theme.spacing(1),
    top: theme.spacing(0),
    color: theme.palette.button.main,
  },
  code: {
    paddingTop: theme.spacing(0),
    marginTop: theme.spacing(-1) + 'px!important',
  },
  pushRight: {
    flex: 1,
    visibility: 'hidden',
    opacity: 0,
  },
});

const SHOW_SOURCE_TOOLTIP = 'Show the full source code';
const HIDE_SOURCE_TOOLTIP = 'Hide the full source code';
const INSTANTIATION_NOT_FOUND = 'Instantiation not found';
const EDIT_TOOLTIP = 'Edit in CodeSandbox';
const COPY_SOUCE_TOOLTIP = 'Copy the source';

class Code extends Component {
  constructor(props) {
    super(props);
    this.state = {
      source: false,
      sourceTooltip: SHOW_SOURCE_TOOLTIP,
    };
    this.handleSourceClick = this.handleSourceClick.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
    this.handleCopySourceClick = this.handleCopySourceClick.bind(this);
  }

  getInstantiation(file, element) {
    let re = new RegExp(`<${element}(.|\\n)+?\\/>`);
    let matches = file.match(re);
    let match = matches[0]
      .replace('        />', '/>')
      .replace(new RegExp('        ', 'g'), '  ');
    return matches ? match : INSTANTIATION_NOT_FOUND;
  }

  handleSourceClick() {
    const sourceTooltip = this.state.source
      ? SHOW_SOURCE_TOOLTIP
      : HIDE_SOURCE_TOOLTIP;
    this.setState({ source: !this.state.source, sourceTooltip: sourceTooltip });
  }

  handleEditClick() {
    console.log('Open CodeSandbox');
  }

  handleCopySourceClick() {
    console.log('Copy Source, Show dialog');
  }

  getToolbarButtons() {
    const { sourceTooltip } = this.state;
    const { classes } = this.props;

    const sourceButton = (
      <IconButtonWithTooltip
        disabled={false}
        onClick={this.handleSourceClick}
        className={classes.button}
        icon={faCode}
        tooltip={sourceTooltip}
      />
    );
    const editButton = (
      <IconButtonWithTooltip
        disabled={true}
        onClick={this.handleEditClick}
        className={classes.button}
        icon={faEdit}
        tooltip={EDIT_TOOLTIP}
      />
    );
    const copyButton = (
      <IconButtonWithTooltip
        disabled={true}
        onClick={this.handleCopySourceClick}
        className={classes.button}
        icon={faCopy}
        tooltip={COPY_SOUCE_TOOLTIP}
      />
    );
    return (
      <div>
        {sourceButton}
        {editButton}
        {copyButton}
      </div>
    );
  }

  render() {
    const { classes, file, element } = this.props;
    const { source } = this.state;

    const content = source ? file : this.getInstantiation(file, element);
    const toolbarButtons = this.getToolbarButtons();

    return (
      <div>
        <Toolbar className={classes.toolbar}>
          <div className={classes.pushRight} />
          {toolbarButtons}
        </Toolbar>
        <SyntaxHighlighter
          className={classes.code}
          language="jsx"
          style={darcula}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Code);
