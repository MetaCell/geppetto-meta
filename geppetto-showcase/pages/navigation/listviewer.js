import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import ListViewerMarkdown from "../../../geppetto-client/geppetto-ui/src/list-viewer/README.md";


export default class ListViewer extends Component {
    render() {
        const { currentPageHandler } = this.props;

        return (
            <Showcase
                markdown={ListViewerMarkdown}
                currentPageHandler={currentPageHandler}
            />
        );
    }
}
