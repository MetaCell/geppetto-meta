import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import FlexlayoutMarkdown from "@geppettoengine/geppetto-ui/flex-layout/README.md";


export default class FlexLayout extends Component {
    render() {
        const { currentPageHandler } = this.props;

        return (
            <Showcase
                markdown={FlexlayoutMarkdown}
                currentPageHandler={currentPageHandler}
            />
        );
    }
}
