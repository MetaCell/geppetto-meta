import { MyComponent } from '../components/MyComponent';
import BigImageViewerExample from '../examples/BigImageViewerExample';
import DicomViewerExample from '../examples/DicomViewerExample';
import CanvasExample from '../components/CanvasExample';

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