import ConnectivityMarkdown from '@geppettoengine/geppetto-ui/connectivity-viewer/README.md';
import CanvasVRMarkdown from '@geppettoengine/geppetto-ui/vr-canvas/README.md';
import Canvas3DMarkdown from '@geppettoengine/geppetto-ui/3d-canvas/README.md';
import TreeMarkdown from '@geppettoengine/geppetto-ui/tree-viewer/README.md';
import HTMLViewerMarkdown from '@geppettoengine/geppetto-ui/html-viewer/README.md';
import LoaderMarkdown from '@geppettoengine/geppetto-ui/loader/README.md';
import BigImageViewerMarkdown from '@geppettoengine/geppetto-ui/big-image-viewer/README.md';
import DicomViewerMarkdown from '@geppettoengine/geppetto-ui/dicom-viewer/README.md';
import MenuMarkdown from '@geppettoengine/geppetto-ui/menu/README.md';
import MoviePlayerMarkdown from '@geppettoengine/geppetto-ui/movie-player/README.md';
import PlotMarkdown from '@geppettoengine/geppetto-ui/plot/README.md';
import GraphVisualizationMarkdown from '@geppettoengine/geppetto-ui/graph-visualization/README.md';
import FlexlayoutMarkdown from '@geppettoengine/geppetto-ui/flex-layout/README.md';
import ListViewerMarkdown from '@geppettoengine/geppetto-ui/list-viewer/README.md';
import PythonConsoleMarkdown from '@geppettoengine/geppetto-ui/python-console/README.md';

const pages = [
  {
    parent: 'Data Viewers',
    name: '3D Canvas',
    to: '/dataviewers/canvas',
    markdown: Canvas3DMarkdown,
  },
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
    markdown: CanvasVRMarkdown,
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
