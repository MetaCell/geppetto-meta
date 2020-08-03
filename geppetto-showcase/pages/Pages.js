import ConnectivityMarkdown from '../../geppetto-client/geppetto-ui/src/connectivity-viewer/README.md';
// import CanvasVRMarkdown from '../../geppetto-client/geppetto-ui/src/canvas-vr/README.md';
import TreeMarkdown from '../../geppetto-client/geppetto-ui/src/tree-viewer/README.md';
import HTMLViewerMarkdown from '../../geppetto-client/geppetto-ui/src/html-viewer/README.md';
import LoaderMarkdown from '../../geppetto-client/geppetto-ui/src/loader/README.md';
import BigImageViewerMarkdown from '../../geppetto-client/geppetto-ui/src/big-image-viewer/README.md';
import DicomViewerMarkdown from '../../geppetto-client/geppetto-ui/src/dicom-viewer/README.md';
import MenuMarkdown from '../../geppetto-client/geppetto-ui/src/menu/README.md';
import MoviePlayerMarkdown from '../../geppetto-client/geppetto-ui/src/movie-player/README.md';
import PlotMarkdown from '../../geppetto-client/geppetto-ui/src/plot/README.md';
import GraphVisualizationMarkdown from '../../geppetto-client/geppetto-ui/src/graph-visualization/README.md';
import FlexlayoutMarkdown from '../../geppetto-client/geppetto-ui/src/flex-layout/README.md';
import ListViewerMarkdown from '../../geppetto-client/geppetto-ui/src/list-viewer/README.md';
import PythonConsoleMarkdown from '../../geppetto-client/geppetto-ui/src/python-console/README.md';

const pages = [
  {
    parent: 'Data Viewers',
    name: 'Big Image Viewer',
    to: '/dataviewers/bigimgviewer',
    markdown: BigImageViewerMarkdown,
  },
  {
    parent: 'Data Viewers',
    name: 'Connectivity Viewer',
    to: '/dataviewers/connectivity',
    markdown: ConnectivityMarkdown,
  },
  {
    parent: 'Data Viewers',
    name: 'Dicom Viewer',
    to: '/dataviewers/dicomviewer',
    markdown: DicomViewerMarkdown,
  },
  {
    parent: 'Data Viewers',
    name: 'Graph Visualizer',
    to: '/dataviewers/graphvisualizer',
    markdown: GraphVisualizationMarkdown,
  },
  {
    parent: 'Data Viewers',
    name: 'HTML Viewer',
    to: '/dataviewers/htmlviewer',
    markdown: HTMLViewerMarkdown,
  },
  {
    parent: 'Data Viewers',
    name: 'Movie Player',
    to: '/dataviewers/movieplayer',
    markdown: MoviePlayerMarkdown,
  },
  {
    parent: 'Data Viewers',
    name: 'Plot',
    to: '/dataviewers/plot',
    markdown: PlotMarkdown,
  },
  {
    parent: 'Data Viewers',
    name: 'VR Canvas',
    to: '/dataviewers/vrcanvas',
    markdown: null,
  },
  {
    parent: 'Data Viewers',
    name: '3D Canvas',
    to: '/dataviewers/canvas',
    markdown: null,
  },
  {
    parent: 'Data Viewers',
    name: 'Stack Viewer',
    to: '/dataviewers/stackviewer',
    markdown: null,
  },
  {
    parent: 'Navigation/Layout',
    name: 'Flex Layout',
    to: '/navigation/flexlayout',
    markdown: FlexlayoutMarkdown,
  },
  {
    parent: 'Navigation/Layout',
    name: 'List Viewer',
    to: '/navigation/listviewer',
    markdown: ListViewerMarkdown,
  },
  {
    parent: 'Navigation/Layout',
    name: 'Loader',
    to: '/navigation/loader',
    markdown: LoaderMarkdown,
  },
  {
    parent: 'Navigation/Layout',
    name: 'Menu',
    to: '/navigation/menu',
    markdown: MenuMarkdown,
  },
  {
    parent: 'Navigation/Layout',
    name: 'Tree Viewer',
    to: '/navigation/treeviewer',
    markdown: TreeMarkdown,
  },
  {
    parent: 'Programmatic Interfaces',
    name: 'Python Console',
    to: '/programmatic/pythonconsole',
    markdown: PythonConsoleMarkdown,
  },
  {
    parent: 'Programmatic Interfaces',
    name: 'Javascript Console',
    to: '/programmatic/jsconsole',
    markdown: null,
  },
];

export default pages;
