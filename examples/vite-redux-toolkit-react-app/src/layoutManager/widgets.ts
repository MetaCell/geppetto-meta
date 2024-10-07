import { WidgetStatus, type Widget } from "@metacell/geppetto-meta-client/common/layout/model";

export const componentWidget = (name: string, color: string, panelName="panel1") : Widget => ({
  id: name,
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
  config: undefined
});

export const threeDViewerWidget = () => ({
  id: 'ThreeDViewer',
  name: "3D Viewer",
  component: 'ThreeDViewer',
  panelName: "leftPanel",
  enableClose: false,
  status: WidgetStatus.ACTIVE,
});
