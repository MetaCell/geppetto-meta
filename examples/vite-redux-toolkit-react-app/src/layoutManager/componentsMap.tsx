import MyComponent from "../components/MyComponent";
import DicomViewer from "../components/viewers/Dicom/DicomViewer";
// import CanvasExample from "../components/viewers/Dicom/CanvasExample";
import Canvas3DExample from "../components/viewers/Dicom/Canvas3DExample";

const componentMap = {
  MyComponent: MyComponent,
  "Dicom Viewer": DicomViewer,
  canvasWidget: Canvas3DExample,
};

export default componentMap;
