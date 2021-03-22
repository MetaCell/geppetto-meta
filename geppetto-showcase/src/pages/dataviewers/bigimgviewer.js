import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import BigImageViewerMarkdown from "@geppettoengine/geppetto-ui/big-image-viewer/README.md";


export default class BigImageViewer extends Component {
    render() {
        const { currentPageHandler } = this.props;

        return (
            <Showcase
                markdown={BigImageViewerMarkdown}
                currentPageHandler={currentPageHandler}
            />
        );
    }
}
