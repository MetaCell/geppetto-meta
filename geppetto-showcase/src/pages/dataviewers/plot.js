import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import PlotMarkdown from "@geppettoengine/geppetto-ui/plot/README.md";


export default class Plot extends Component {
    render() {
        const { currentPageHandler } = this.props;

        return (
            <Showcase
                markdown={PlotMarkdown}
                currentPageHandler={currentPageHandler}
            />
        );
    }
}
