import React from 'react'
import NRRDViewer from "@metacell/geppetto-meta-ui/nrrd-viewer/NRRDViewer";
import PropTypes from 'prop-types';


const NRRDViewerShowcase = ({ nnrdUrls }) => (
  <NRRDViewer />
)

NRRDViewerShowcase.propTypes = {
  /**
   * NRRD URLs to be rendered in this component
   */
  nrrdUrls: PropTypes.arrayOf(PropTypes.string).isRequired
}


export default NRRDViewerShowcase;