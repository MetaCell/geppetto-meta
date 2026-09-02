import { WidgetStatus } from "@metacell/geppetto";
import { ViewerType } from "../models";

export const infoWidget = () => ({
  id: ViewerType.default,
  name: "Info",
  component: ViewerType.default,
  panelName: "rightPanel",
  enableClose: false,
  status: WidgetStatus.ACTIVE,
});

export const dicomViewerWidget = () => ({
  id: ViewerType.dicom,
  name: "DICOM Viewer",
  component: ViewerType.dicom,
  panelName: "leftPanel",
  enableClose: false,
  status: WidgetStatus.ACTIVE,
});

export const canvas3DWidget = () => ({
  id: ViewerType.canvas3d,
  name: "3D Canvas",
  component: ViewerType.canvas3d,
  panelName: "rightPanel",
  enableClose: false,
  status: WidgetStatus.ACTIVE,
});
