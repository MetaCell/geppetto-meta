import React, {Component} from "react";
import {createMuiTheme, responsiveFontSizes, MuiThemeProvider} from "@material-ui/core/styles";
import {blue, green, orange, purple} from "@material-ui/core/colors";
import Main from "./ui/Main";
import CssBaseline from "@material-ui/core/CssBaseline";


//todo: Change to react context?
const GEPPETTO = {};
window.GEPPETTO = GEPPETTO;
require('@geppettoengine/geppetto-client/js/common/GEPPETTO.Resources').default(GEPPETTO);
require('@geppettoengine/geppetto-client/js/pages/geppetto/GEPPETTO.Events').default(GEPPETTO);
const Manager = require('@geppettoengine/geppetto-client/js/common/Manager').default;
const ModelFactory = require('@geppettoengine/geppetto-client/js/geppettoModel/ModelFactory').default(GEPPETTO);
const testModel = require('@geppettoengine/geppetto-client/__tests__/resources/test_model.json');
const AA = require('@geppettoengine/geppetto-client/js/geppettoModel/model/ArrayElementInstance').default;

GEPPETTO.Utility = {};
GEPPETTO.Utility.extractMethodsFromObject = () => [];
GEPPETTO.trigger = evt => console.log(evt, 'triggered');
GEPPETTO.Manager = new Manager();
console.warn = () => null;
GEPPETTO.CommandController = {
    log: console.log,
    createTags: (a, b) => null
};

export default class App extends Component {
    render() {
        let theme = createMuiTheme({
            typography: {
                fontFamily: 'Raleway, Arial',
            },
            palette: {
                type: "dark",
                primary: {
                    main: orange[500],
                },
                secondary: {
                    main: blue[500],
                },
            }
        });
        theme = responsiveFontSizes(theme);

        return (
            <MuiThemeProvider theme={theme}>
                <CssBaseline/>
                <Main/>
            </MuiThemeProvider>
        );
    }
}