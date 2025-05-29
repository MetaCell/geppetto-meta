import { WidgetStatus } from "@metacell/geppetto-meta-client/common/layout/model";
import { ViewerType } from "../models";

export const componentWidget = () => ({
  id: ViewerType.default,
  name: 'panel1',
  component: ViewerType.default,
  panelName: 'rightPanel',
  enableClose: false,
  status: WidgetStatus.ACTIVE
});

export const DicomViewerWidget = () => ({
  id: ViewerType.dicomViewer,
  name: "DicomViewer Viewer",
  component: ViewerType.dicomViewer,
  panelName: "leftPanel",
  enableClose: false,
  status: WidgetStatus.ACTIVE
});

export const CanvasWidget = () =>({
  id: ViewerType.ThreeD,
  name: "3D Canvas",
  component: ViewerType.ThreeD,
  panelName: "rightPanel",
  enableClose: false,
  status: WidgetStatus.ACTIVE,
})