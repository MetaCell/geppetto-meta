import { WidgetStatus } from "@metacell/geppetto-meta-client/common/layout/model";

export const componentWidget = () => ({
  id: 'Default',
  name: 'panel1',
  component: "MyComponent",
  panelName: 'leftPanel',
  enableClose: false,
  status: WidgetStatus.ACTIVE
});
export const GraphVisualizationWidget = () => ({
  id: 'Graph Visualization',
  name: "Graph Visualization",
  component: 'Graph Visualization',
  panelName: "rightPanel",
  enableClose: false,
  status: WidgetStatus.ACTIVE
});
