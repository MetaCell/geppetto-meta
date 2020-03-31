import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import IconButtonWithTooltip from "./IconButtonWithTooltip";
import {faCode} from "@fortawesome/free-solid-svg-icons";
import Toolbar from "@material-ui/core/Toolbar";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const styles = (theme) => ({
    toolbar: {
        padding: "0",
        marginLeft: "5px"
    },
    button: {
        padding: "8px",
        top: "0",
        color: "#fc6320"
    },
});


class Code extends Component {
    constructor(props) {
        super(props);
        this.state = {
            source: false,
            sourceTooltip: "Show the full source code",
        };
        this.handleSourceClick = this.handleSourceClick.bind(this)
    }

    getInstantiation(file, element) {
        let re = new RegExp(`<${element}(.|\\n)+?\\/>`);
        let matches = file.match(re);
        return matches? matches: "Instantiation not found. Please check if your config.examples.element is correct.";
    }


    handleSourceClick() {
        const sourceTooltip = this.state.source ? "Show the full source code" : "Hide the full source code";
        this.setState({source: !this.state.source, sourceTooltip: sourceTooltip})
    }

    render() {
        const {classes, file, element} = this.props;
        const {source, sourceTooltip} = this.state;

        const content = source ? file : this.getInstantiation(file, element);
        const sourceButton = (<IconButtonWithTooltip
            disabled={false}
            onClick={this.handleSourceClick}
            className={classes.button}
            icon={faCode}
            tooltip={sourceTooltip}
        />);

        return (
            <div>
                <Toolbar className={classes.toolbar}>
                        {sourceButton}
                </Toolbar>
                <SyntaxHighlighter language="javascript" style={darcula}>
                    {content}
                </SyntaxHighlighter>
            </div>
        )
    }
}

export default withStyles(styles, {withTheme: true})(Code);