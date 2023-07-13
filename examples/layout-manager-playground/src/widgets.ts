// @ts-ignore
import { WidgetStatus, Widget } from "@metacell/geppetto-meta-client/common/layout/model";


export const widgetIds = {
  component1: 'component1',
  component2: 'component2',
}

export const component1Widget = () : Widget => ({
  id: widgetIds.component1,
  name: "Component 1",
  component: widgetIds.component1,
  panelName: "panel1",
  enableClose: true,
  status: WidgetStatus.ACTIVE,
  defaultWeight: 50
});

export const component2Widget = () : Widget => ({
  id: widgetIds.component2,
  name: "Component 2",
  component: widgetIds.component2,
  panelName: "panel2",
  enableClose: true,
  status: WidgetStatus.ACTIVE,
  defaultWeight: 50
});