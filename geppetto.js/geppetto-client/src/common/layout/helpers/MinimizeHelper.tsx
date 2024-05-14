import * as React from 'react';
import {findBorderToMinimizeTo, getWidget} from "../utils";
import {Store} from "redux";
import {Widget, WidgetStatus} from "../model";
import {updateWidget} from "../actions";
// @ts-ignore
import Model from '@metacell/geppetto-meta-ui/flex-layout/src/model/Model';
import {MINIMIZED_PANEL} from '../../layout';
import {createTabSet, moveWidget} from "./FlexLayoutHelper";


export class MinimizeHelper {
    private readonly isMinimizeEnabled: boolean;
    private readonly minimizeBorderID: string;
    private store: Store;
    private model: Model;

    constructor(isMinimizeEnabled, model) {
        const borders = model.getBorderSet().getBorders()
        const borderToMinimizeTo = findBorderToMinimizeTo(borders)
        this.isMinimizeEnabled = isMinimizeEnabled;
        this.model = model
        this.minimizeBorderID = borderToMinimizeTo?.getId() || MINIMIZED_PANEL;
        this.store = null;
    }

    setStore(store: Store<any>) {
        this.store = store;
    }

    isMinimized(widget: Widget): boolean {
        return widget.panelName == this.minimizeBorderID;
    }

    addMinimizeButtonToTabset(panel, renderValues) {
        if (this.isMinimizeEnabled && this.minimizeBorderID) {
            if (panel.getChildren().length > 0) {
                renderValues.buttons.push(
                    <div
                        key={panel.getId()}
                        className="fa fa-window-minimize customIconFlexLayout minimizeButton"
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
        if(this.store && this.minimizeBorderID) {
            
            let updatedWidget = { ...getWidget(this.store, widgetId) };
            updatedWidget.status = WidgetStatus.MINIMIZED;
            updatedWidget.defaultPanel = updatedWidget.panelName;
            updatedWidget.panelName = this.minimizeBorderID;
            this.store.dispatch(updateWidget(updatedWidget))
        } else{
            console.warn("Unable to minimize widget");
        }
    }

    restoreWidgetIfNecessary(previousWidget: Widget, mergedWidget: Widget): boolean {
        if (previousWidget.status != mergedWidget.status && previousWidget.status == WidgetStatus.MINIMIZED) {
            this.restoreWidget(mergedWidget);
            return true
        }
        return false
    }

    /**
     * Restore widget.
     *
     * @param widget
     * @private
     */
    restoreWidget(widget: Widget) {
        const { model } = this;
        widget.panelName = widget.defaultPanel;
        const panelName = widget.panelName;
        let tabset = model.getNodeById(panelName);
        if (tabset === undefined) {
            createTabSet(model, panelName, widget.defaultPosition, widget.defaultWeight);
        }
        moveWidget(model, widget);
    }
}