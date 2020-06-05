import { connect } from "react-redux";
import {
  showSpinner,
  spotlightClosed,
  spotlightLoaded,
} from '../common/actions/actions';

import _ControlPanel from './interface/controlPanel/controlpanel';
export const ControlPanel = connect(
  (state, ownProps) => ({
    icon: ownProps.icon,
    enableInfiniteScroll: ownProps.enableInfiniteScroll,
    useBuiltInFilters: ownProps.useBuiltInFilters,
    resultsPerPage: ownProps.resultsPerPage,
    enablePagination: ownProps.enablePagination,
    projectStatus: state.client.project.status,
  }),
  null,
  null,
  { withRef: true }
)(_ControlPanel);

import _ExperimentControls from './interface/simulationControls/ExperimentControls';
export const SimulationControls = connect(
  (state, ownProps) => ({
    runConfiguration: ownProps.runConfiguration,
    hideHelp: ownProps.hideHelp,
    hideRun: ownProps.hideRun,
    hidePlay: ownProps.hidePlay,
    hidePause: ownProps.hidePause,
    hideStop: ownProps.hideStop,
    experimentId: state.client.experiment.id,
    experimentStatus: state.client.experiment.status,
    projectStatus: state.client.project.status,
  }),
  null
)(_ExperimentControls);

import _ExperimentsTable from './interface/experimentsTable/ExperimentsTable';
export const ExperimentsTable = connect(
  (state, ownProps) => ({
    experimentStatus: state.client.experiment.status,
    projectStatus: state.client.project.status,
  }),
  dispatch => ({ showSpinner: message => dispatch(showSpinner(message)) }),
  null,
  { withRef: true }
)(_ExperimentsTable);

import _LoadingSpinner from './interface/loadingSpinner/LoadingSpinner';
export const LoadingSpinner = connect(
  (state, ownProps) => ({
    spinnerMessage: state.client.components.spinner.message,
    spinnerVisible: state.client.components.spinner.visible,
  }),
  null,
  null,
  { withRef: true }
)(_LoadingSpinner);

import _SaveControl from './interface/save/SaveControl';
export const SaveControl = connect(
  (state, ownProps) => ({ projectStatus: state.client.project.status }),
  null,
  null,
  { withRef: true }
)(_SaveControl);

import _Spotlight from './interface/spotlight/spotlight';
export const Spotlight = connect(
  (state, ownProps) => ({
    icon: ownProps.icon,
    modelStatus: state.client.model.status,
    projectStatus: state.client.project.status,
    experimentId: state.client.experiment.id,
    experimentStatus: state.client.experiment.status,
  }),
  dispatch => ({
    spotlightClosed: () => dispatch(spotlightClosed()),
    spotlightLoaded: () => dispatch(spotlightLoaded()),
  }),
  null,
  { withRef: true }
)(_Spotlight);

import _Tutorial from './interface/tutorial/Tutorial';
export const Tutorial = connect(
  (state, ownProps) => ({
    closeHandler: ownProps.closeHandler,
    tutorialData: ownProps.tutorialData,
    closeByDefault: ownProps.closeByDefault,
    showMemoryCheckbox: ownProps.showMemoryCheckbox,
    tutorialsList: ownProps.tutorialsList,
    tutorialMessageClass: ownProps.tutorialMessageClass,
    tutorialURL: ownProps.tutorialURL,
    modelStatus: state.client.model.status,
    tutorialVisible: state.client.components.tutorial.visible,
  }),
  null,
  null,
  { withRef: true }
)(_Tutorial);

