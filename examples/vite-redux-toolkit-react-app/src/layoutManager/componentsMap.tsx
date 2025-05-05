import MyComponent from "../components/MyComponent";
import DicomViewer from "../components/viewers/DicomViewer";
// import CanvasExample from "../components/viewers/CanvasExample";
import Canvas3DExample from "../components/viewers/Canvas3DExample";
import { ViewerType } from "../models";

const componentMap = {
  [ViewerType.default]: MyComponent,
  [ViewerType.dicomViewer]: DicomViewer,
  [ViewerType.ThreeD]: Canvas3DExample,
};

export default componentMap;
