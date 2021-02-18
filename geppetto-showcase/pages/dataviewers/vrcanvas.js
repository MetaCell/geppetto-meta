import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import CanvasVRMarkdown from "../../../geppetto-client/geppetto-ui/src/vr-canvas/README.md";


export default class VRCanvasPage extends Component {
    render() {
        const { currentPageHandler } = this.props;

        return (
            <Showcase
                markdown={CanvasVRMarkdown}
                currentPageHandler={currentPageHandler}
            />
        );
    }
}
