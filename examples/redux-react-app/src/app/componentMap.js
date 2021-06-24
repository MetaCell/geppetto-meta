import React from 'react';
import { MyComponent } from '../components/MyComponent';
import BigImageViewerExample from '@metacell/geppetto-meta-ui/big-image-viewer/showcase/examples/BigImageViewerExample';
import DicomViewerExample from '@metacell/geppetto-meta-ui/dicom-viewer/showcase/examples/DicomViewerExample';

class Wrapper extends React.Component {

    render() {
        return <MyComponent />
    }
}

class ImageViewerWrapper extends React.Component {

    render() {
        return <BigImageViewerExample />
    }
}

/**
 * Key of the component is the `component` attribute of the widgetConfiguration.
 * 
 * This map is used inside the LayoutManager to know which component to display for a given widget.
 */
const componentMap = {
    // Does not support functional components or withStyles !
    'myComponent': Wrapper,
    'imageViewer': ImageViewerWrapper,
    'dicomViewer': DicomViewerExample,
};

export default componentMap