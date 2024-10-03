import { WidgetStatus } from "@metacell/geppetto-meta-client/common/layout/model";

// Define your widgets here with unique IDs
export const MyComponentWidget = {
  id: 'myComponent',
  name: "My Component",
  component: "myComponent",
  panelName: "rightPanel",
  status: WidgetStatus.ACTIVE,
};

export const ImageViewerWidget = {
  id: 'imageViewer',
  name: "Image Viewer",
  component: "imageViewer",
  panelName: "leftPanel",
  status: WidgetStatus.ACTIVE,
};

export const DicomViewerWidget = {
  id: 'dicomViewer',
  name: "DICOM Viewer",
  component: "dicomViewer",
  panelName: "leftPanel",
  status: WidgetStatus.ACTIVE,
};

export const CanvasWidget = {
  id: 'canvasWidget',
  name: "3D Canvas",
  component: "canvas",
  panelName: "rightPanel",
  status: WidgetStatus.ACTIVE,
};
