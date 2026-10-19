import { TabsetPosition, WidgetStatus } from "../model";
import * as FlexLayout from "flexlayout-react";

/**
 * Create a new tab set.
 *
 * @param model
 * @param {string} tabsetID the id of the tab set
 * @param position
 * @param weight
 * @private
 */
export function createTabSet(model, tabsetID, position = TabsetPosition.RIGHT, weight = 50) {
  const rootNode = model.getRoot();

  const tabset = new FlexLayout.TabSetNode(model, { id: tabsetID });
  switch (position) {
    case TabsetPosition.RIGHT:
      rootNode.getChildren().forEach(node => node.setWeight(100 - weight));
      rootNode.addChild(tabset);
      break;
    case TabsetPosition.LEFT:
      rootNode.getChildren().forEach(node => node.setWeight(100 - weight));
      rootNode.addChild(tabset, 0);
      break;
    case TabsetPosition.BOTTOM:
    case TabsetPosition.TOP: {
      const hrow = new FlexLayout.RowNode(model, rootNode.windowId, {});

      if (position === TabsetPosition.BOTTOM) {
        (hrow as any).addChild(tabset);
      } else {
        (hrow as any).addChild(tabset, 0);
      }

      rootNode.getChildren().forEach(child => {
        if (child.getWeight) {
          const newWeight = (child as FlexLayout.TabSetNode).getWeight() / 2;
          child.setWeight(newWeight);
          (hrow as any).addChild(child, 0);
        }
      });

      rootNode.removeAll();
      rootNode.addChild(hrow);
      (tabset as any).setWeight(80);
      (hrow as any).setWeight(100);
    }
  }
  return tabset;
}

export function moveWidget(model, widget, select = widget.status === WidgetStatus.ACTIVE) {
  model.doAction(
    FlexLayout.Actions.moveNode(
      widget.id,
      widget.panelName,
      FlexLayout.DockLocation.CENTER,
      widget.pos,
      select,
    ),
  );
}
