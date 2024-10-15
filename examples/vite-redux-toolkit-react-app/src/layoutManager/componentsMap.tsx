import MyComponent from '../components/MyComponent'
import ThreeDViewer from "../components/viewers/ThreeD/ThreeDViewer.tsx";
import DicomViewer from "../components/viewers/Dicom/DicomViewer.tsx";

const componentMap = {
  'MyComponent': MyComponent,
  'ThreeDViewer': ThreeDViewer,
  'dicomViewer': DicomViewer,
}

export default componentMap
