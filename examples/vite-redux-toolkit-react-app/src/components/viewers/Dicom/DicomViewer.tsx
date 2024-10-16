import React, { useState } from 'react';
import DicomViewer from '@metacell/geppetto-meta-ui/dicom-viewer/preconf/DicomViewer';
import Loader from "@metacell/geppetto-meta-ui/loader/Loader";

const DicomViewerExample: React.FC = () => {
  const [ready, setReady] = useState<boolean>(false);

  const onLoaded = () => {
    setReady(true);
  };

  const data = '/assets/EX_SITU_2009_UCSD_T1_WEIGHTED.nii.gz';

  return <>
    <Loader active={!ready}/>
    <DicomViewer
      id="DicomViewer"
      data={data}
      showDownloadButton={true}
      onLoaded={onLoaded}
      loaderOptions= {{ showLoader: false }}
      toolbarOptions={{ innerDivStyles: { backgroundColor: 'rgb(0,0,0,0)' } }}
    />
  </>
};

export default DicomViewerExample;
