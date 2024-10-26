import { WidgetStatus } from "@metacell/geppetto-meta-client/common/layout/model";

export const componentWidget = () => ({
  id: 'Default',
  name: 'panel1',
  component: "MyComponent",
  panelName: 'leftPanel',
  enableClose: false,
  status: WidgetStatus.ACTIVE
});

export const DicomViewerWidget = () => ({
  id: 'Dicom Viewer',
  name: "DicomViewer Viewer",
  component: 'Dicom Viewer',
  panelName: "leftPanel",
  enableClose: false,
  status: WidgetStatus.ACTIVE
});
