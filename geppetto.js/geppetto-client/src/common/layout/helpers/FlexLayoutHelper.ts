
import {BaseNode, TabsetPosition} from "../model";
// @ts-ignore
import * as FlexLayout from '@metacell/geppetto-meta-ui/flex-layout/src/index';


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
    const rootNode = model.getNodeById("root");

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

            model.doAction(FlexLayout.Actions.updateNodeAttributes(tabset.getId(), {weight: 80}))

            const hrow = new FlexLayout.RowNode(model, rootNode.windowId, {});
            model.doAction(FlexLayout.Actions.updateNodeAttributes(hrow.getId(), {weight: 100}))

            rootNode.getChildren().forEach(child => {
                if (child.getWeight) {
                    const newWeight = (child as FlexLayout.TabSetNode).getWeight() / 2;
                    child.setWeight(newWeight);
                    model.doAction(FlexLayout.Actions.moveNode((child as BaseNode).getId(), hrow.getId(), FlexLayout.DockLocation.CENTER, -1))
                }
            });
            if (position === TabsetPosition.BOTTOM) {
                model.doAction(FlexLayout.Actions.moveNode(tabset.getId(), hrow.getId(), FlexLayout.DockLocation.CENTER, -1))
            } else {
                model.doAction(FlexLayout.Actions.moveNode(tabset.getId(), hrow.getId(), FlexLayout.DockLocation.CENTER, 0))
            }

            rootNode._removeAll();
            rootNode.addChild(hrow, 0);
        }
    }
    return tabset
}

export function moveWidget(model, widget) {
    model.doAction(
        FlexLayout.Actions.moveNode(
            widget.id,
            widget.panelName,
            FlexLayout.DockLocation.CENTER,
            widget.pos
        )
    );
}