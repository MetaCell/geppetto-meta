import React from 'react';
import { MyComponent } from '../components/MyComponent';
import BigImageViewerExample from '../components/ImageViewer';

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

const componentMap = {
    // Does not support functional components or withStyles !
    'myComponent': Wrapper,
    'imageViewer': ImageViewerWrapper,
};

export default componentMap