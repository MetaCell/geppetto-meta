import React from 'react';
// Canvas examples
import AuditoryCortexExample2 from './3d-canvas/examples/AuditoryCortexExample2';
import VFBExample from './3d-canvas/examples/VFBExample';
import CA1CellExample from './3d-canvas/examples/CA1CellExample';
import AuditoryCortexExample from './3d-canvas/examples/AuditoryCortexExample';
import SimpleInstancesExample from './3d-canvas/examples/SimpleInstancesExample';
import MultipleInstancesExample from './3d-canvas/examples/MultipleInstancesExample';

// Big image viewer example
import BigImageViewerExample from './big-image-viewer/examples/BigImageViewerExample';


const ShowcaseExamplesComponentsMap = props => {

  const { exampleComponentName, parentRef } = props;

  switch (exampleComponentName) {
  case '3D Canvas Auditory Cortex Example 2':
    return <AuditoryCortexExample2 ref={parentRef} />;
  case '3D Canvas VFB Example':
    return <VFBExample ref={parentRef} />
  case '3D Canvas CA1 Pyramidal Cell Example':
    return <CA1CellExample ref={parentRef} />;
  case '3D Canvas Auditory Cortex Example':
    return <AuditoryCortexExample ref={parentRef} />;
  case 'Simple Instances Example':
    return <SimpleInstancesExample ref={parentRef} />;
  case 'Multiple Instances Example':
    return <MultipleInstancesExample ref={parentRef} />;
  case 'Big Image Viewer Example':
    return <BigImageViewerExample ref={parentRef} />;
  default:
    return <AuditoryCortexExample ref={parentRef} />;
  }

}

export default ShowcaseExamplesComponentsMap;
