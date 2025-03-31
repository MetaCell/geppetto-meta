import React, { useState, useEffect, useRef } from 'react';
import Canvas from "@metacell/geppetto-meta-ui/3d-canvas/Canvas";
import CameraControls from "@metacell/geppetto-meta-ui/camera-controls/CameraControls";
import SimpleInstance from "@metacell/geppetto-meta-core/model/SimpleInstance";
import neuron from '/assets/SketchVolumeViewer_SAAVR_SAAVR_1_1_0000_draco.gltf?url&raw';
import contact from '/assets/Sketch_Volume_Viewer_AIB_Rby_AIAR_AIB_Rby_AIAR_1_1_0000_green_0_24947b6670.gltf?url&raw';
import Button from "@material-ui/core/Button";
import { applySelection, mapToCanvasData } from "@metacell/geppetto-meta-ui/3d-canvas/utils/SelectionUtils";
import CaptureControls from "@metacell/geppetto-meta-ui/capture-controls/CaptureControls";
import Resources from '@metacell/geppetto-meta-core/Resources';
import ModelFactory from '@metacell/geppetto-meta-core/ModelFactory';
import { augmentInstancesArray } from '@metacell/geppetto-meta-core/Instances';
import Loader from "@metacell/geppetto-meta-ui/loader/Loader";
import { Box } from "@mui/material";

const classes = {
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'stretch',
  },
};

const instance1spec = {
  eClass: "SimpleInstance",
  id: "ANeuron",
  name: "The first SimpleInstance to be rendered with Geppetto Canvas",
  type: { eClass: "SimpleType" },
  visualValue: {
    eClass: Resources.GLTF,
    gltf: neuron
  }
};

const instance2spec = {
  eClass: "SimpleInstance",
  id: "AContact",
  name: "The second SimpleInstance to be rendered with Geppetto Canvas",
  type: { eClass: "SimpleType" },
  visualValue: {
    eClass: Resources.GLTF,
    gltf: contact
  }
};

function loadInstances() {
  ModelFactory.cleanModel();
  const instance1 = new SimpleInstance(instance1spec);
  const instance2 = new SimpleInstance(instance2spec);
  window.Instances = [instance1, instance2];
  augmentInstancesArray(window.Instances);
}

function getProxyInstances() {
  return window.Instances?.map(i => ({
    instancePath: i.getId(),
    color: { r: 0, g: 1, b: 0, a: 1 },
    visibility: true
  })) || [];
}

const SimpleInstancesExample: React.FC = () => {
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [showLoader, setShowLoader] = useState(false);
  const [showModel, setShowModel] = useState(false);

  useEffect(() => {
    loadInstances();
    setData(getProxyInstances());
  }, []);

  const cameraOptions = {
    angle: 50,
    near: 0.01,
    far: 1000,
    baseZoom: 1,
    cameraControls: {
      instance: CameraControls,
      props: { wireframeButtonEnabled: false, buttonStyles: { color: '#ff0000' } },
    },
    initialFlip: ['y', 'z'],
    reset: false,
    autorotate: false,
    wireframe: false,
  };

  const captureOptions = {
    captureControls: {
      instance: CaptureControls,
      props: { buttonStyles: { color: '#0000ff' } }
    },
    recorderOptions: {
      mediaRecorderOptions: { mimeType: 'video/webm' },
      blobOptions: { type: 'video/webm' }
    },
    screenshotOptions: {
      resolution: {
        width: 3840,
        height: 2160,
      },
      quality: 0.95,
      pixelRatio: 1,
      filter: () => true
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layoutRef.current && !layoutRef.current.contains(event.target as Node)) {
        setShowModel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setShowLoader(true);
    // loadInstances();
    // setData(getProxyInstances());
    setShowModel(true);
    setShowLoader(false);
  };

  const onSelection = (selectedInstances: any) => {
    setData(applySelection(data, selectedInstances));
  };

  const canvasData = mapToCanvasData(data);

  return showLoader ? (
    <Loader active={true} />
  ) : showModel ? (
    <Box ref={layoutRef} className={classes.container} style={classes.container}>
      <Canvas
        data={canvasData}
        cameraOptions={cameraOptions}
        captureOptions={captureOptions}
        backgroundColor={0x505050}
        onSelection={onSelection}
        onMount={(scene: any) => console.log(scene)}
        onHoverListeners={{ 'hoverId': (objs: any[], canvasX: number, canvasY: number) => { } }}
        dracoDecoderPath={'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/libs/draco/'}
      />
    </Box>
  ) : (
    <Button variant="outlined" color="primary" onClick={handleToggle}>
            Show Example
    </Button>
  );
};

export default SimpleInstancesExample;
