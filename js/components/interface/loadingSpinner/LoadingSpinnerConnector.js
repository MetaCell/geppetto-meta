import { connect } from "react-redux";

import _LoadingSpinner from './LoadingSpinner';
export const LoadingSpinner = connect(
  (state, ownProps) => ({
    spinnerMessage: state.client.components.spinner.message,
    spinnerVisible: state.client.components.spinner.visible,
  }),
  null,
  null,
  { withRef: true }
)(_LoadingSpinner);