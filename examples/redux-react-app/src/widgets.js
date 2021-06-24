import { WidgetStatus } from "@metacell/geppetto-meta-client/common/layout/model";

export const MyComponentWidget = {
    id: 'myComponent',
    name: "My Component",
    component: "myComponent",
    panelName: "rightPanel",
    enableClose: false,
    status: WidgetStatus.ACTIVE,
};

export const ImageViewerWidget = {
    id: 'imageViewer',
    component: "imageViewer",
    panelName: "leftPanel",
    enableClose: false,
    status: WidgetStatus.ACTIVE,
};

export const DicomViewerWidget = {
    id: 'dicomViewer',
    component: "dicomViewer",
    panelName: "leftPanel",
    enableClose: false,
    status: WidgetStatus.ACTIVE,
};