import { WidgetStatus } from "@metacell/geppetto-meta-client/common/layout/model";

export const componentWidget = () => ({
  id: 'MyComponent',
  name: 'panel1',
  component: "MyComponent",
  panelName: 'leftPanel',
  enableClose: true,
  status: WidgetStatus.ACTIVE
});

export const threeDViewerWidget = () => ({
  id: 'ThreeDViewer',
  name: "3D Viewer",
  component: 'ThreeDViewer',
  panelName: "leftPanel",
  enableClose: false,
  status: WidgetStatus.ACTIVE
});
