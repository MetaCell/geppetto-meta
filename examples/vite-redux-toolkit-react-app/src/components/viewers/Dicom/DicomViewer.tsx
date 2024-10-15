import React, { useState, useEffect } from 'react';
import DicomViewer from '@metacell/geppetto-meta-ui/dicom-viewer/DicomViewer';
import Loader from '@metacell/geppetto-meta-ui/loader/Loader';
import {
  faThLarge,
  faSquare,
  faExchangeAlt,
  faExpandAlt,
  faCompressAlt,
} from '@fortawesome/free-solid-svg-icons';
import Box from "@mui/material/Box";
import '@metacell/geppetto-meta-ui/flex-layout/style/light.scss'

const DicomViewerExample: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [mode, setMode] = useState<'single_view' | 'quad_view'>('quad_view');
  const [orientation, setOrientation] = useState<'coronal' | 'sagittal' | 'axial' | '3d'>('3d');
  
  const data = '/assets/EX_SITU_2009_UCSD_T1_WEIGHTED.nii.gz';
  
  // useEffect(() => {
  //   setReady(false);
  // }, []);
  //
  const onLoaded = () => {
    setReady(true);
  };
  
  const changeMode = () => {
    setMode((prevMode) => (prevMode === 'single_view' ? 'quad_view' : 'single_view'));
  };
  
  const changeOrientation = () => {
    setOrientation((prevOrientation) => {
      switch (prevOrientation) {
        case 'coronal':
          return 'sagittal';
        case 'sagittal':
          return 'axial';
        case 'axial':
          return '3d';
        default:
          return 'coronal';
      }
    });
  };
  
  const restore = () => {
    setFullscreen(false);
  };
  
  const fullScreen = () => {
    setFullscreen(true);
  };

  return ready ? (
    <Box
      style={{
        position: 'relative',
        height: '800px',
        width: '1000px',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      <DicomViewer
        id="DicomViewerContainer"
        mode={mode}
        fullScreen={fullscreen}
        orientation={orientation}
        data={data}
        onShiftClick="goToPoint"
        onCtrlClick="toggleMode"
        onRightClick={(event: any) => console.log('Right click!', event)}
        showDownloadButton={true}
        onLoaded={onLoaded}
        toolbarOptions={{ innerDivStyles: { backgroundColor: 'rgb(0,0,0,0);' } }}
        toolbarButtons={{
          single_view: [
            { icon: faThLarge, tooltip: 'Multi View', action: changeMode },
            { icon: faExchangeAlt, tooltip: 'Change Orientation', action: changeOrientation },
          ],
          quad_view: [
            { icon: faSquare, tooltip: 'Single View', action: changeMode },
          ],
          fullScreen: [
            { icon: faCompressAlt, tooltip: 'Restore', action: restore },
          ],
          minimized: [
            { icon: faExpandAlt, tooltip: 'Maximize', action: fullScreen },
          ],
        }}
      />
    </Box>
  ) : (
    <Loader />
  );
};

export default DicomViewerExample;
