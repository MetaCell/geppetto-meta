# Menu Component

React component use to display a list of options in a Drop-down menu style. 

[Menu Component](./Menu.js)

Component Properties:

- **buttons**: The property button defines the list of buttons the menu will have at the first level. Each object defined inside the buttons list has the properties below:
- **label** : defines the name displayed on the button itself. 
- **position** : defines where the window with the full menu expanded for that button has to appear. this might be one of the following choices: 'bottom-end', 'bottom-start', 'bottom', 'left-end', 'left-start', 'left', 'right-end', 'right-start', 'right', 'top-end', 'top-start', 'top'. 
- **list** : defines the list of objects that we need to use to populate the 1st level menu, a brief explanation of how to fill these elements will be given later. 
- **dynamicListInjector** : if the property 'list' is not provided we can use the property dynamicListInjector and connect this to the menuHandler to feed this button with a dynamic list created by the menu handler.


## Example

```
menu/showcase/examples/MenuShowcase
```

```javascript
    
import React, { Component } from "react";
import Menu from "./../Menu";
import model from "./../model.json";

export default class MenuShowcase extends Component {
  constructor (props) {
    super(props);
    this.menuConfiguration = require('./../menuConfiguration').toolbarMenu;
    this.menuHandler = this.menuHandler.bind(this);
  }

  menuHandler (click) {
    const historyList = [];
    console.log(click.handlerAction);
    if (click.handlerAction === 'historyMenuInjector') {
      historyList.push(
        {
          label: "adult brain template JFRC2",
          icon: "",
          action: {
            handlerAction: "triggerSetTermInfo",
            value: console.log("adult brain template JFRC2")
          }
        },
      );
    }
    return historyList;
  }

  render () {
    return (
      <Menu
        configuration={this.menuConfiguration}
        menuHandler={this.menuHandler}/>
    );
  }
}
```

## Libraries

[React](https://www.npmjs.com/package/react)
[@Material-ui/core](https://www.npmjs.com/package/@material-ui/core)