import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import Code from "./Code";

const styles = (theme) => ({
    root: {
        width: '100%',
    }

});


class Showcase extends Component {
    constructor(props) {
        super(props);
        this.componentRef = React.createRef();
    }

    render() {
        const {classes, configs} = this.props;

        console.log(configs);
        return (
            <div className={classes.root}>
                <h1>{configs.name}</h1>
                <p>{configs.description}</p>
                {configs.examples.map(obj => {
                    const file = obj.file.default.split('\n').join('\n');
                    return (
                        <div key={obj.name}>
                            <h2>{obj.name}</h2>
                            <p>{obj.description}</p>
                            <obj.component ref={this.componentRef}/>
                            <Code file={file} element={obj.element}></Code>
                        </div>
                    );
                })
                }
            </div>
        )
    }
}

export default withStyles(styles, {withTheme: true})(Showcase);