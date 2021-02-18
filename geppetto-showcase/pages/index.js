import {lazy} from "react";

const BigImgViewer = lazy(() => import('./dataviewers/bigimgviewer'));
const Canvas = lazy(() => import('./dataviewers/canvas'));
const ConnectivityViewer = lazy(() => import('./dataviewers/connectivityviewer'));
const DicomViewer = lazy(() => import('./dataviewers/dicomviewer'));
const GraphVisualizer = lazy(() => import('./dataviewers/graphvisualizer'));
const HTMLViewer = lazy(() => import('./dataviewers/htmlviewer'));
const MoviePlayer = lazy(() => import('./dataviewers/movieplayer'));
const Plot = lazy(() => import('./dataviewers/plot'));
const VRCanvas = lazy(() => import('./dataviewers/vrcanvas'));
const FlexLayout = lazy(() => import('./navigation/flexlayout'));
const ListViewer = lazy(() => import('./navigation/listviewer'));
const Loader = lazy(() => import('./navigation/loader'));
const Menu = lazy(() => import('./navigation/menu'));
const TreeViewer = lazy(() => import('./navigation/treeviewer'));
const PythonConsole = lazy(() => import('./programmatic/pythonconsole'));
const pages = [
    {
        component: BigImgViewer,
        parent: 'Data Viewers',
        name: 'Big Image Viewer',
        to: '/dataviewers/bigimgviewer',
    },
    {
        component: Canvas,
        parent: 'Data Viewers',
        name: '3D Canvas',
        to: '/dataviewers/canvas',
    },
    {
        component: ConnectivityViewer,
        parent: 'Data Viewers',
        name: 'Connectivity Viewer',
        to: '/dataviewers/connectivity',
    },
    {
        component: DicomViewer,
        parent: 'Data Viewers',
        name: 'Dicom Viewer',
        to: '/dataviewers/dicomviewer',
    },
    {
        component: GraphVisualizer,
        parent: 'Data Viewers',
        name: 'Graph Visualizer',
        to: '/dataviewers/graphvisualizer',
    },
    {
        component: HTMLViewer,
        parent: 'Data Viewers',
        name: 'HTML Viewer',
        to: '/dataviewers/htmlviewer',
    },
    {
        component: MoviePlayer,
        parent: 'Data Viewers',
        name: 'Movie Player',
        to: '/dataviewers/movieplayer',
    },
    {
        component: Plot,
        parent: 'Data Viewers',
        name: 'Plot',
        to: '/dataviewers/plot',
    },
    {
        component: null,
        parent: 'Data Viewers',
        name: 'Stack Viewer',
        to: '/dataviewers/stackviewer',
    },
    {
        component: VRCanvas,
        parent: 'Data Viewers',
        name: 'VR Canvas',
        to: '/dataviewers/vrcanvas',
    },
    {
        component: FlexLayout,
        parent: 'Navigation/Layout',
        name: 'Flex Layout',
        to: '/navigation/flexlayout',
    },
    {
        component: ListViewer,
        parent: 'Navigation/Layout',
        name: 'List Viewer',
        to: '/navigation/listviewer',
    },
    {
        component: Loader,
        parent: 'Navigation/Layout',
        name: 'Loader',
        to: '/navigation/loader',
    },
    {
        component: Menu,
        parent: 'Navigation/Layout',
        name: 'Menu',
        to: '/navigation/menu',
    },
    {
        component: TreeViewer,
        parent: 'Navigation/Layout',
        name: 'Tree Viewer',
        to: '/navigation/treeviewer',
    },
    {
        component: null,
        parent: 'Programmatic Interfaces',
        name: 'Javascript Console',
        to: '/programmatic/jsconsole',
    },
    {
        component: PythonConsole,
        parent: 'Programmatic Interfaces',
        name: 'Python Console',
        to: '/programmatic/pythonconsole',
    },

]
export default pages