import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import MoviePlayerMarkdown from "../../../geppetto-client/geppetto-ui/src/movie-player/README.md";


export default class MoviePlayer extends Component {
    render() {
        const { currentPageHandler } = this.props;

        return (
            <Showcase
                markdown={MoviePlayerMarkdown}
                currentPageHandler={currentPageHandler}
            />
        );
    }
}