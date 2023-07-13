import * as React from 'react';
import {findBorderToMinimizeTo, getWidget} from "../utils";
import {Store} from "redux";
import {WidgetStatus} from "../model";
import {updateWidget} from "../actions";


export class MinimizeHelper {
    private readonly isMinimizeEnabled: boolean;
    private minimizeBorderID: string;
    private store: Store;

    constructor(isMinimizeEnabled, model) {
        const borders = model.getBorderSet().getBorders()
        const borderToMinimizeTo = findBorderToMinimizeTo(borders)
        this.isMinimizeEnabled = isMinimizeEnabled;
        this.minimizeBorderID = borderToMinimizeTo?.getId();
        this.store = null;
    }

    setStore(store: Store<any>) {
        this.store = store;
    }

    addMinimizeButtonToTabset(panel, renderValues) {
        if (this.isMinimizeEnabled && this.minimizeBorderID) {
            if (panel.getChildren().length > 0) {
                renderValues.buttons.push(
                    <div
                        key={panel.getId()}
                        className="fa fa-window-minimize customIconFlexLayout"
                        onClick={() => {
                            this.minimizeWidget(panel.getSelectedNode().getId());
                        }}
                    />
                );
            }
        }
    }

    /**
     * Minimize a widget.
     *
     * @param widgetId
     * @private
     */
    minimizeWidget(widgetId) {
        if(this.store && this.minimizeBorderID){
            let updatedWidget = { ...getWidget(this.store, widgetId) };
            updatedWidget.status = WidgetStatus.MINIMIZED;
            updatedWidget.defaultPanel = updatedWidget.panelName;
            updatedWidget.panelName = this.minimizeBorderID;
            this.store.dispatch(updateWidget(updatedWidget))
        }else{
            console.warn("Unable to minimize widget");
        }
    }
}