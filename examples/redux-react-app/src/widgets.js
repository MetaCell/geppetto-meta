import { WidgetStatus } from "@metacell/geppetto-meta-client/common/layout/model";

export const MyComponentWidget = {
    id: 'myComponent',
    name: "My Component",
    component: "myComponent",
    panelName: "rightPanel",
    enableClose: true,
    enableRename: true,
    enableDrag: true,
    status: WidgetStatus.ACTIVE,
    config: {
        text: "The woods are lovely, dark and deep. But I have promises to keep, and miles to go before I sleep."
    },
};

export const ImageViewerWidget = {
    id: 'imageViewer',
    name: "Image Viewer",
    component: "imageViewer",
    panelName: "leftPanel",
    enableClose: true,
    hideOnClose: true,
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

export const CanvasWidget = {
    id: 'canvasWidget',
    name: "3D Canvas",
    component: "canvas",
    panelName: "rightPanel",
    enableClose: false,
    status: WidgetStatus.ACTIVE,
};

export const SimpleComponentWidget = {
    id: 'simpleComponentWidget',
    name: "Simple Component",
    component: "simpleComponent",
    panelName: "rightPanel",
    enableClose: true,
    hideOnClose: true,
    status: WidgetStatus.ACTIVE,
};