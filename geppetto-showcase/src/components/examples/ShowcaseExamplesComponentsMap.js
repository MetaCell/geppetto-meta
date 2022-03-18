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

// Connectivity viewer examples
import ConnectivityShowcaseForce from './connectivity-viewer/examples/ConnectivityShowcaseForce';
import ConnectivityShowcaseMatrix from './connectivity-viewer/examples/ConnectivityShowcaseMatrix';

// Dicom viewer example
import DicomViewerExample from './dicom-viewer/examples/DicomViewerExample';

// Graph visualizer example
import GraphVisualizationShowcase from './graph-visualization/examples/GraphVisualizationShowcase';

// HTML viewer example
import HTMLViewerShowcase from './html-viewer/examples/HTMLViewerShowcase';

// Movie player example
import MoviePlayerShowcase from './movie-player/examples/MoviePlayerShowcase';

// Plot component example
import PlotShowcase from './plot/examples/PlotShowcase';

// Flex layout example
import FlexLayoutShowcase from './flex-layout/examples/FlexLayoutShowcase';

// List viewer examples
import ListViewerShowcaseDefault from './list-viewer/examples/ListViewerShowcaseDefault';
import ListViewerShowcaseFilter from './list-viewer/examples/ListViewerShowcaseFilter';
import ListViewerShowcaseScroll from './list-viewer/examples/ListViewerShowcaseScroll';
import ListViewerShowcaseFull from './list-viewer/examples/ListViewerShowcaseFull';

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
  case 'Connectivity Force':
    return <ConnectivityShowcaseForce ref={parentRef} />;
  case 'Connectivity Matrix':
    return <ConnectivityShowcaseMatrix ref={parentRef} />;
  case 'Dicom Viewer Example':
    return <DicomViewerExample ref={parentRef} />;
  case 'Graph Visualization Example 1':
    return <GraphVisualizationShowcase ref={parentRef} />;
  case 'HTMLViewer Example 1':
    return <HTMLViewerShowcase ref={parentRef} />;
  case 'Movie Player Example':
    return <MoviePlayerShowcase rerf={parentRef} />;
  case 'Plot Component Example':
    return <PlotShowcase ref={parentRef} />;
  case 'Flexible Layout Example':
    return <FlexLayoutShowcase ref={parentRef} />;
  case 'List Viewer Default':
    return <ListViewerShowcaseDefault ref={parentRef} />;
  case 'List Viewer Data Filtering':
    return <ListViewerShowcaseFilter ref={parentRef} />;
  case 'List Viewer Scroll':
    return <ListViewerShowcaseScroll ref={parentRef} />;
  case 'List Viewer Full':
    return <ListViewerShowcaseFull ref={parentRef} />;
  default:
    return <AuditoryCortexExample ref={parentRef} />;
  }

}

export default ShowcaseExamplesComponentsMap;
