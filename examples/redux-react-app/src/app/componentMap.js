import { MyComponent } from '../components/MyComponent';
import BigImageViewerExample from '@metacell/geppetto-meta-ui/big-image-viewer/BigImageViewer';
import DicomViewerExample from '@metacell/geppetto-meta-ui/dicom-viewer/DicomViewer';
import CanvasExample from '../components/CanvasExample';
import SimpleDroppable from '../components/SimpleDroppable';

/**
 * Key of the component is the `component` attribute of the widgetConfiguration.
 *
 * This map is used inside the LayoutManager to know which component to display for a given widget.
 */
const componentMap = {
  myComponent: MyComponent,
  imageViewer: BigImageViewerExample,
  dicomViewer: DicomViewerExample,
  canvas: CanvasExample,
  simpleComponent: SimpleDroppable,
};

export default componentMap;
