import * as React from 'react';


export default class TabsetIconFactory {

  factory(widgetConfig) {
    return this.createIcon(widgetConfig.icon)
  }

  createIcon(iconName) {
    return <i className={`tabset-icon ${iconName}`} />
  }
} 