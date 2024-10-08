import React, { useState, useEffect } from 'react';
import DicomViewer from '@metacell/geppetto-meta-ui/dicom-viewer/DicomViewer';
import Loader from "@metacell/geppetto-meta-ui/loader/Loader";
const DicomViewerExample: React.FC = () => {
  const [ready, setReady] = useState<boolean>(true);
  
  const onLoaded = () => {
    setReady(true);
  };
  
  const data = '/assets/EX_SITU_2009_UCSD_T1_WEIGHTED.nii.gz';

  return ready ? (
    <DicomViewer
      id="DicomViewer"
      data={data}
      onShiftClick="goToPoint"
      onCtrlClick="toggleMode"
      showDownloadButton={true}
      onLoaded={onLoaded}
      toolbarOptions={{ innerDivStyles: { backgroundColor: 'rgb(0,0,0,0)' } }}
    />
  ) : (
    <Loader />
  );
};

export default DicomViewerExample;
