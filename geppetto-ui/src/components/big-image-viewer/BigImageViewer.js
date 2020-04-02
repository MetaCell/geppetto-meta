import React, {Component} from 'react';
import {withStyles} from '@material-ui/core';
import OpenSeaDragon from 'openseadragon';
import * as util from "../../utilities";
import IconButtonWithTooltip from "../common/IconButtonWithTooltip";
import Toolbar from "@material-ui/core/Toolbar";
import { faHome, faSearchPlus, faSearchMinus } from "@fortawesome/free-solid-svg-icons";



const styles = {
    bigImageViewer: {
        height: '800px',
    },
    toolbar: {
        padding: "0",
        marginLeft: "5px"
    },
    toolbarBox: {backgroundColor: "rgb(0,0,0,0.5);",},
    button: {
        padding: "8px",
        top: "0",
        color: "#fc6320"
    },

};

class BigImageViewer extends Component {

    constructor(props) {
        super(props);

        const settings = {
            id: this.props.id + "_component",
            zoomInButton: "zoom-in",
            zoomOutButton: "zoom-out",
            homeButton: "home",
            fullPageButton: "full-page",
        };

        this.state = {
            settings: util.extend(settings, this.props.settings),
            file: this.extractFilePath(this.props.data)
        };

        // this.download = this.download.bind(this);
        this.goHome = this.goHome.bind(this);
        this.zoomIn = this.zoomIn.bind(this);
        this.zoomOut = this.zoomOut.bind(this);
        this.fullPage = this.fullPage.bind(this);

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.loadViewer();
    }

    componentDidMount() {
        this.loadViewer();
    }

    extractFilePath(data) {
        let file;
        if (data !== undefined) {
            if (data.getMetaType === undefined) {
                file = data;
            } else if (data.getMetaType() === "Instance" && data.getVariable().getInitialValues()[0].value.format === "DZI") {
                file = data.getVariable().getInitialValues()[0].value.data;
            }
        }
        return file;
    }

    loadViewer() {
        if (this.state.file !== undefined) {
            if (this.viewer !== undefined) {
                this.viewer.destroy();
            }
            this.state.settings.tileSources = this.state.file;
            this.viewer = OpenSeaDragon(this.state.settings);
        }
    }

    // These four methods are not exposed by OpenSeaDragon
    goHome() {
        this.viewer.viewport.goHome()
    }

    zoomIn() {
        this.viewer.viewport.zoomBy(
            this.viewer.zoomPerClick / 1.0
        );
        this.viewer.viewport.applyConstraints();

    }

    zoomOut() {
        this.viewer.viewport.zoomBy(
            1.0 / this.viewer.zoomPerClick
        );
        this.viewer.viewport.applyConstraints();
    }

    fullPage() {
        this.viewer.setFullScreen(true);
        this.viewer.fullPageButton.element.focus();
        this.viewer.viewport.applyConstraints();
    }

    getCustomButtons() {
        const customButtons = [];
        customButtons.push({'icon': faSearchMinus, 'id': 'zoom-out', 'title': 'Zoom Out', 'action': this.zoomOut});
        customButtons.push({'icon': faSearchPlus, 'id': 'zoom-in', 'title': 'Zoom In', 'action': this.zoomIn});
        customButtons.push({'icon': faHome, 'id': 'home', 'title': 'Center Image', 'action': this.goHome});
        return customButtons;
    }

    render() {
        const {classes} = this.props;
        const customButtons = this.getCustomButtons();

        return (
            <div className={classes.bigImageViewer}>
                <Toolbar className={classes.toolbar}>
                    <div className={classes.toolbarBox}>
                        {customButtons.map(customButton =>
                            <IconButtonWithTooltip
                                key={customButton.id}
                                disabled={false}
                                onClick={() => customButton.action()}
                                className={classes.button}
                                tooltip={customButton.title}
                                icon={customButton.icon}
                            />
                        )}
                    </div>
                </Toolbar>
                <div id={this.props.id + "_component"} className={classes.bigImageViewer}/>
            </div>
        )
    }
};

export default withStyles(styles)(BigImageViewer);
