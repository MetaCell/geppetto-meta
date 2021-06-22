import { connect } from "react-redux";
import {
  hideSpinner,
  showSpinner,
} from '../common/actions/actions';


import LoadingSpinnerBase from './interface/LoadingSpinner';
export const LoadingSpinner = connect(
  state => ({ spinner: state.client.components.spinner }),
  dispatch => ({ 
    showSpinner: msg => dispatch(showSpinner(msg)),
    hideSpinner: () => dispatch(hideSpinner()),
  }),
  null,
  { forwardRef: true }
)(LoadingSpinnerBase);

