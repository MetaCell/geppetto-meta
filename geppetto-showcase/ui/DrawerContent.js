import React, {Component} from "react";
import ListItem from "@material-ui/core/ListItem";
import {ExpandLess, ExpandMore} from "@material-ui/icons";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import Collapse from "@material-ui/core/Collapse";
import {withStyles} from "@material-ui/core/styles";
import ConnectivityShowcase
    from "@geppettoengine/geppetto-client/js/components/interface/connectivity/showcase/ConnectivityShowcase";
import ListViewerShowcase
    from "@geppettoengine/geppetto-client/js/components/interface/listViewer/showcase/ListViewerShowcase";
import MenuShowcase from "@geppettoengine/geppetto-client/js/components/interface/menu/showcase/MenuShowcase";

const styles = theme => ({
    nested: {
        paddingLeft: theme.spacing(4),
    },

    lists: {
        backgroundColor: theme.palette.background.paper,
        marginTop: theme.spacing(1),
    },
});


class DrawerContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            interfaceOpen: false,
            controlsOpen: false
        };
        this.interfaceHandler = this.interfaceHandler.bind(this);
        this.controlsHandler = this.controlsHandler.bind(this);
    }

    interfaceHandler() {
        this.setState(() => ({interfaceOpen: !this.state.interfaceOpen}))
    }

    controlsHandler() {
        this.setState(() => ({controlsOpen: !this.state.controlsOpen}))
    }

    render() {
        const {interfaceOpen, controlsOpen} = this.state;
        const {classes, contentHandler} = this.props;

        // todo: Change to showcase geppetto client component
        const content = {
            "Interface": {
                "open": interfaceOpen,
                "handler": this.interfaceHandler,
                "children": [
                    {
                        "name": "Connectivity",
                        "component": <ConnectivityShowcase/>
                    },
                    {
                        "name": "ListViewer",
                        "component": <ListViewerShowcase/>
                    },
                    {
                        "name": "Menu",
                        "component": <MenuShowcase/>
                    }
                ]
            },
            "Controls": {
                "open": controlsOpen,
                "handler": this.controlsHandler,
                "children": []
            },
        };
        return (
            <nav className={classes.lists} aria-label="mailbox folders">

                <li>
                    {Object.keys(content).map((key) => {
                        const open = content[key].open;
                        const handler = content[key].handler;
                        const children = content[key].children;
                        return (
                            <List key={key}>
                                <ListItem key={key} button onClick={handler}>
                                    <ListItemText primary={key}/>
                                    {open != null ? open ? <ExpandLess/> : <ExpandMore/> : null}
                                </ListItem>
                                <Collapse component="li" in={open} timeout="auto" unmountOnExit>
                                    <List disablePadding>
                                        {children.map((value) => {
                                            const name = value.name;
                                            const component = value.component;
                                            return (
                                                <ListItem key={value.name} button className={classes.nested} onClick={()=>contentHandler(component)}>
                                                    <ListItemText primary={name}/>
                                                </ListItem>
                                            )
                                        })}
                                    </List>
                                </Collapse>
                            </List>
                        )
                    })}
                </li>
            </nav>
        );
    }
}

export default withStyles(styles, {withTheme: true})(DrawerContent);