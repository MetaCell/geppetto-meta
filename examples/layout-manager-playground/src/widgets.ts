import { WidgetStatus, type Widget } from "@metacell/geppetto-meta-client/common/layout/model";



export const componentWidget = (name: string, color: string, panelName = "panel1", defaultPosition?, id?: string): Widget => ({
  id: id || name + Math.random(),
  name: name,
  component: "MyComponent",
  panelName,
  enableClose: true,
  status: WidgetStatus.ACTIVE,
  props: {
    name,
    color
  },
  session: undefined,
  config: undefined,
  defaultPosition: defaultPosition
});