import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import TreeMarkdown from "../../../geppetto-client/geppetto-ui/src/tree-viewer/README.md";


export default class TreeViewer extends Component {
    render() {
        const { currentPageHandler } = this.props;

        return (
            <Showcase
                markdown={TreeMarkdown}
                currentPageHandler={currentPageHandler}
            />
        );
    }
}
