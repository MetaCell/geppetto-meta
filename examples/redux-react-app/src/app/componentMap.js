import { MyComponent } from '../components/MyComponent';
import BigImageViewerExample from '@metacell/geppetto-meta-ui/big-image-viewer/showcase/examples/BigImageViewerExample';
import DicomViewerExample from '@metacell/geppetto-meta-ui/dicom-viewer/showcase/examples/DicomViewerExample';
import CanvasExample from '../components/CanvasExample';
import CanvasNRRDExample from '../components/CanvasNRRDExample';

/**
 * Key of the component is the `component` attribute of the widgetConfiguration.
 * 
 * This map is used inside the LayoutManager to know which component to display for a given widget.
 */
const componentMap = {
    'myComponent': MyComponent,
    'imageViewer': BigImageViewerExample,
    'dicomViewer': DicomViewerExample,
    'canvas': CanvasExample
};

export default componentMap