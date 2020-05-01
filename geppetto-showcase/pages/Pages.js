import ConnectivityMarkdown from '../../geppetto-ui/src/components/connectivity-viewer/README.md';
import TreeMarkdown from '../../geppetto-ui/src/components/tree-viewer/README.md';
import HTMLViewerMarkdown from '../../geppetto-ui/src/components/html-viewer/README.md';
import BigImageViewerMarkdown from '../../geppetto-ui/src/components/big-image-viewer/README.md';
import DicomViewerMarkdown from '../../geppetto-ui/src/components/dicom-viewer/README.md';
import MenuMarkdown from '../../geppetto-ui/src/components/menu/README.md';
import MoviePlayerMarkdown from '../../geppetto-ui/src/components/movie-player/README.md';
import PlotMarkdown from '../../geppetto-ui/src/components/plot/README.md';
import GraphVisualizationMarkdown from '../../geppetto-ui/src/components/graph-visualization/README.md';
import FlexlayoutMarkdown from '../../geppetto-ui/src/components/flex-layout/README.md';
import ListViewerMarkdown from '../../geppetto-ui/src/components/list-viewer/README.md';
import PythonConsoleMarkdown from '../../geppetto-ui/src/components/python-console/README.md';

const pages = [
  {
    name: 'Big Image Viewer',
    to: '/components/dataviewers/bigimgviewer',
    markdown: BigImageViewerMarkdown,
  },
  {
    name: 'Connectivity Viewer',
    to: '/components/dataviewers/connectivity',
    markdown: ConnectivityMarkdown,
  },
  {
    name: 'Dicom Viewer',
    to: '/components/dataviewers/dicomviewer',
    markdown: DicomViewerMarkdown,
  },
  {
    name: 'Graph Visualizer',
    to: '/components/dataviewers/graphvisualizer',
    markdown: GraphVisualizationMarkdown,
  },
  {
    name: 'HTML Viewer',
    to: '/components/dataviewers/htmlviewer',
    markdown: HTMLViewerMarkdown,
  },
  {
    name: 'Movie Player',
    to: '/components/dataviewers/movieplayer',
    markdown: MoviePlayerMarkdown,
  },
  {
    name: 'Plot',
    to: '/components/dataviewers/plot',
    markdown: PlotMarkdown,
  },
  {
    name: '3D Canvas',
    to: '/components/dataviewers/canvas',
    markdown: BigImageViewerMarkdown,
  },
  {
    name: 'Stack Viewer',
    to: '/components/dataviewers/stackviewer',
    markdown: BigImageViewerMarkdown,
  },
  {
    name: 'Flex Layout',
    to: '/components/navigation/flexlayout',
    markdown: FlexlayoutMarkdown,
  },
  {
    name: 'List Viewer',
    to: '/components/navigation/listviewer',
    markdown: ListViewerMarkdown,
  },
  {
    name: 'Menu',
    to: '/components/navigation/menu',
    markdown: MenuMarkdown,
  },
  {
    name: 'Tree Viewer',
    to: '/components/navigation/treeviewer',
    markdown: TreeMarkdown,
  },
  {
    name: 'Python Console',
    to: '/components/programmatic/pythonconsole',
    markdown: PythonConsoleMarkdown,
  },
  {
    name: 'Javascript Console',
    to: '/components/programmatic/jsconsole',
    markdown: BigImageViewerMarkdown,
  },
];

export default pages;
