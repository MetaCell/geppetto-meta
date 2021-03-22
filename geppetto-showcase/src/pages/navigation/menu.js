import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import MenuMarkdown from "../../../geppetto-client/geppetto-ui/src/menu/README.md";


export default class Menu extends Component {
    render() {
        const { currentPageHandler } = this.props;

        return (
            <Showcase
                markdown={MenuMarkdown}
                currentPageHandler={currentPageHandler}
            />
        );
    }
}
