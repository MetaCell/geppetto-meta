import React, { Component } from "react";

import { withStyles } from "@material-ui/core/styles";
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

    getTitle(dom) {
        return dom.querySelector('h1').innerHTML
    }

    getDescription(dom) {
        return this.getContentUntil('h2', dom.querySelector('h1'))
    }

    getProps(dom) {
        return dom.getElementById('props').nextElementSibling.innerHTML
    }

    getExamples(dom) {
        let examplesDom = this.getElementsUntil("h2", dom.getElementById('examples')).filter((elem) => elem.matches('h3'))
        let examples = []
        while (examplesDom.length) {
            examples.push(this.getExample(examplesDom.pop()))
        }
        return examples
    }

    getExample(start) {
        let elements = this.getElementsUntil('pre', start, true)
        let example = {
            'name': start.innerHTML,
            'description': ''
        }

        for (let elem of elements) {
            if (elem.matches('pre')) {
                let data = elem.children[0].innerText.split(':')
                example['element'] = data[0].trim()
                example['component'] = require("../../../geppetto-ui/src/components/" + data[1].trim() + ".js").default
                example['file'] = require("!raw-loader!../../../geppetto-ui/src/components/" + data[1].trim() + ".js")
            }
            else {
                example['description'] += elem.innerHTML
            }
        }

        return example
    }

    getNextSibling(selector, start) {
        let sibling = start.nextElementSibling;
        while (sibling) {
            if (sibling.matches(selector)) {
                return sibling;
            }
            sibling = sibling.nextElementSibling
        }
    }

    getElementsUntil(selector, start, included = false) {
        let siblings = []
        let elem = start.nextElementSibling;
        while (elem) {
            if (elem.matches(selector)) {
                if (included) {
                    siblings.push(elem)
                }
                break;
            }
            siblings.push(elem);
            elem = elem.nextElementSibling;
        }
        return siblings
    }

    getContentUntil(selector, start) {
        return this.getElementsUntil(selector, start).reduce((str, elem) => str + elem.innerHTML, "")
    }

    getConfigFromMarkdown(markdown) {
        let dom = new DOMParser().parseFromString(markdown, "text/html")
        let configs = {}
        configs['name'] = this.getTitle(dom)
        configs['description'] = this.getDescription(dom)
        configs['props'] = this.getProps(dom)
        configs['examples'] = this.getExamples(dom)
        return configs
    }

    render() {
        const { classes, markdown } = this.props;

        const configs = this.getConfigFromMarkdown(markdown)

        return (
            <div className={classes.root}>
                <div className={classes.root}>
                    <h1>{configs.name}</h1>
                    <p>{configs.description}</p>
                    <h2>Props</h2>
                    <div dangerouslySetInnerHTML={{ __html: configs.props }} />
                    {configs.examples.map(obj => {
                        const file = obj.file.default.split('\n').join('\n');
                        return (
                            <div key={obj.name}>
                                <h2>{obj.name}</h2>
                                <p>{obj.description}</p>
                                <obj.component ref={this.componentRef} />
                                <Code file={file} element={obj.element}></Code>
                            </div>
                        );
                    })
                    }
                </div>
            </div>
        )
    }
}

export default withStyles(styles, { withTheme: true })(Showcase);