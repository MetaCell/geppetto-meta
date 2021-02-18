import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import LoaderMarkdown from "../../../geppetto-client/geppetto-ui/src/loader/README.md";


export default class Loader extends Component {
    render() {
        const { currentPageHandler } = this.props;

        return (
            <Showcase
                markdown={LoaderMarkdown}
                currentPageHandler={currentPageHandler}
            />
        );
    }
}
