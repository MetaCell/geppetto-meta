import InfoPanel from "../components/InfoPanel";
import DicomViewerExample from "../components/viewers/DicomViewerExample";
import Canvas3DViewer from "../components/viewers/Canvas3DViewer";
import { ViewerType } from "../models";

const componentMap = {
  [ViewerType.default]: InfoPanel,
  [ViewerType.dicom]: DicomViewerExample,
  [ViewerType.canvas3d]: Canvas3DViewer,
};

export default componentMap;
