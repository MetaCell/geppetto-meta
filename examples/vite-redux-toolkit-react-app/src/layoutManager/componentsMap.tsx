import MyComponent from '../components/MyComponent'
import DicomViewer from "../components/viewers/Dicom/DicomViewer";
import CanvasExample from '../components/viewers/Dicom/CanvasExample.js';

const componentMap = {
  'MyComponent': MyComponent,
  'Dicom Viewer': DicomViewer,
  'canvasWidget': CanvasExample
}

export default componentMap
