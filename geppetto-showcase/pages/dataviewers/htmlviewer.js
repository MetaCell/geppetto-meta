import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import HTMLViewerMarkdown from "../../../geppetto-client/geppetto-ui/src/html-viewer/README.md";


export default class HtmlViewer extends Component {
    render() {
        const { currentPageHandler } = this.props;

        return (
            <Showcase
                markdown={HTMLViewerMarkdown}
                currentPageHandler={currentPageHandler}
            />
        );
    }
}
