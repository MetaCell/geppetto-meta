import MyComponent from "../components/MyComponent";
import DicomViewer from "../components/viewers/Dicom/DicomViewer";
// import CanvasExample from "../components/viewers/Dicom/CanvasExample";
import Canvas3DExample from "../components/viewers/Dicom/Canvas3DExample";
import { ViewerType } from "../models";

const componentMap = {
  [ViewerType.default]: MyComponent,
  [ViewerType.dicomViewer]: DicomViewer,
  [ViewerType.ThreeD]: Canvas3DExample,
};

export default componentMap;
