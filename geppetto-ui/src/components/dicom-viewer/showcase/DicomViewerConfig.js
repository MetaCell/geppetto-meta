import DicomViewerExample from "./examples/DicomViewerExample";


export const DicomViewerConfig = {
    'name': "DicomViewer Main Title",
    'description': "DicomViewer Main Description",
    'examples': [
        {
            "name": "DicomViewer Example 1",
            'description': "DicomViewer Example 1",
            'component': DicomViewerExample,
            'file': require('!raw-loader!./examples/DicomViewerExample.js'),
            'element': "DicomViewer",
        },
    ]
};
