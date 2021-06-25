import { WidgetStatus } from "@metacell/geppetto-meta-client/common/layout/model";

export const MyComponentWidget = {
    id: 'myComponent',
    name: "My Component",
    component: "myComponent",
    panelName: "rightPanel",
    enableClose: true,
    status: WidgetStatus.ACTIVE,
};

export const ImageViewerWidget = {
    id: 'imageViewer',
    name: "Image Viewer",
    component: "imageViewer",
    panelName: "leftPanel",
    enableClose: false,
    status: WidgetStatus.ACTIVE,
};

export const DicomViewerWidget = {
    id: 'dicomViewer',
    name: "DICOM Viewer",
    component: "dicomViewer",
    panelName: "leftPanel",
    enableClose: false,
    status: WidgetStatus.ACTIVE,
};