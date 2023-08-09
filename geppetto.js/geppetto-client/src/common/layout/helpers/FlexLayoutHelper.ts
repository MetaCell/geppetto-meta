
import {TabsetPosition} from "../model";
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
            rootNode.getChildren().forEach(node => node._setWeight(100 - weight));
            rootNode._addChild(tabset);
            break;
        case TabsetPosition.LEFT:
            rootNode.getChildren().forEach(node => node._setWeight(100 - weight));
            rootNode._addChild(tabset, 0);
            break;
        case TabsetPosition.BOTTOM:
        case TabsetPosition.TOP: {

            tabset._setWeight(80);
            let hrow = new FlexLayout.RowNode(model, {});
            hrow._setWeight(100);

            rootNode.getChildren().forEach(child => {
                if (child['getWeight']) {
                    const newWeight = (child as FlexLayout.TabSetNode).getWeight() / 2;
                    child._setWeight(newWeight);
                    hrow._addChild(child);
                }
            });
            if (position === TabsetPosition.BOTTOM) {
                hrow._addChild(tabset)
            } else {
                hrow._addChild(tabset, 0);
            }

            rootNode._removeAll();
            rootNode._addChild(hrow, 0);
        }
    }
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