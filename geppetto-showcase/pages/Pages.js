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
    parent: 'Data Viewers',
    name: 'Big Image Viewer',
    to: '/components/dataviewers/bigimgviewer',
    markdown: BigImageViewerMarkdown,
  },
  {
    parent: 'Data Viewers',
    name: 'Connectivity Viewer',
    to: '/components/dataviewers/connectivity',
    markdown: ConnectivityMarkdown,
  },
  {
    parent: 'Data Viewers',
    name: 'Dicom Viewer',
    to: '/components/dataviewers/dicomviewer',
    markdown: DicomViewerMarkdown,
  },
  {
    parent: 'Data Viewers',
    name: 'Graph Visualizer',
    to: '/components/dataviewers/graphvisualizer',
    markdown: GraphVisualizationMarkdown,
  },
  {
    parent: 'Data Viewers',
    name: 'HTML Viewer',
    to: '/components/dataviewers/htmlviewer',
    markdown: HTMLViewerMarkdown,
  },
  {
    parent: 'Data Viewers',
    name: 'Movie Player',
    to: '/components/dataviewers/movieplayer',
    markdown: MoviePlayerMarkdown,
  },
  {
    parent: 'Data Viewers',
    name: 'Plot',
    to: '/components/dataviewers/plot',
    markdown: PlotMarkdown,
  },
  {
    parent: 'Data Viewers',
    name: '3D Canvas',
    to: '/components/dataviewers/canvas',
    markdown: null,
  },
  {
    parent: 'Data Viewers',
    name: 'Stack Viewer',
    to: '/components/dataviewers/stackviewer',
    markdown: null,
  },
  {
    parent: 'Navigation/Layout',
    name: 'Flex Layout',
    to: '/components/navigation/flexlayout',
    markdown: FlexlayoutMarkdown,
  },
  {
    parent: 'Navigation/Layout',
    name: 'List Viewer',
    to: '/components/navigation/listviewer',
    markdown: ListViewerMarkdown,
  },
  {
    parent: 'Navigation/Layout',
    name: 'Menu',
    to: '/components/navigation/menu',
    markdown: MenuMarkdown,
  },
  {
    parent: 'Navigation/Layout',
    name: 'Tree Viewer',
    to: '/components/navigation/treeviewer',
    markdown: TreeMarkdown,
  },
  {
    parent: 'Programmatic Interfaces',
    name: 'Python Console',
    to: '/components/programmatic/pythonconsole',
    markdown: PythonConsoleMarkdown,
  },
  {
    parent: 'Programmatic Interfaces',
    name: 'Javascript Console',
    to: '/components/programmatic/jsconsole',
    markdown: null,
  },
];

export default pages;
