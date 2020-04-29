# Menu Component

React component use to display a list of options in a Drop-down menu style. 

[Menu Component](./Menu.js)

### Component Properties:

In order to work, the Menu component needs to be given 2 input props:

- **configuration** : Object (Required)
- **menuHandler**: Function (Required) 
	This is a function that contains a switch-case and evaluate what the string contained in the action object is
	and then execute this action with the value provided.

The configuration property object taken by the Menu component is composed of the following properties:

- **buttons**: Array (Required) 
	The property button defines the list of buttons the menu will have at the first level. Each object defined 
	inside the buttons list has the properties below:
- **label** : String (Required) 
	Defines the name displayed on the button itself. 
- **position** : String (Optional)
	Defines where the window with the full menu expanded for that button has to appear. this might be one of the 
	following choices: 'bottom-end', 'bottom-start', 'bottom', 'left-end', 'left-start', 'left', 'right-end', 
	'right-start', 'right', 'top-end', 'top-start', 'top'. 
- **list** : Array (Required) 
	Defines the list of objects that we need to use to populate the 1st level menu, a brief explanation of how to 
	fill these elements will be given later. 
- **dynamicListInjector** : Object(Optional)
	If the property 'list' is not provided we can use the property dynamicListInjector and connect this to the 
	menuHandler to feed this button with a dynamic list created by the menu handler.
- **action**:  Object (Required)
	Another object that contains handlerAction property, the handlerAction property function triggers when the 
	Menu item associated with it is clicked.
- **handlerAction**:  String (Optional)
	The name of the action to be triggered when the Menu item is clicked, will be used by the handler function to 
	decide which action has to be executed for this menu item.
- **parameters** : Array(Optional)
	Parameters associated with the handlerAction when needed.  
	
	Action object property example:
		
	```
	{
		label: "Layers",
		action: {
			handlerAction: "UIElementHandler",
	       parameters: ["controlPanelVisible"]
	    }
	}
	```
	
An example of a configuration object with defined menu items can be find [here](./showcase/menuConfiguration.js).

## Example

[Menu Component Example](./showcase/examples/MenuShowcase)

```javascript
    
import React, { Component } from "react";
import Menu from "./../Menu";
import model from "./../model.json";

export default class MenuShowcase extends Component {
  constructor (props) {
    super(props);
    this.menuConfiguration = require('./../menuConfiguration').menuConfiguration;
    this.menuHandler = this.menuHandler.bind(this);
  }

  /**
   * Handler function triggered when a Menu item is clicked. 
   */
  menuHandler (click) {
    const historyList = [];
    console.log(click.handlerAction);
    // Check the handlerAction associated with Menu item clicked
    if (click.handlerAction === 'historyMenuInjector') {
      // Add to history List.
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

[react](https://www.npmjs.com/package/react)
[@Material-ui/core](https://www.npmjs.com/package/@material-ui/core)