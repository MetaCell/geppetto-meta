import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import DicomViewerMarkdown from "../../../geppetto-client/geppetto-ui/src/dicom-viewer/README.md";


export default class DicomViewer extends Component {
    render() {
        const { currentPageHandler } = this.props;

        return (
            <Showcase
                markdown={DicomViewerMarkdown}
                currentPageHandler={currentPageHandler}
            />
        );
    }
}
