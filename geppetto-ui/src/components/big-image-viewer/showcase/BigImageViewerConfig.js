import BigImageViewerExample
    from "./examples/BigImageViewerExample";


export const BigImageViewerConfig = {
    'name': "BigImageViewer Main Title",
    'description': "BigImageViewer Main Description",
    'examples': [
        {
            "name": "BigImageViewer Example 1",
            'description': "BigImageViewer Example 1",
            'component': BigImageViewerExample,
            'file': require(
                '!raw-loader!./examples/BigImageViewerExample.js'),
            'element': "BigImageViewer",
        },
    ]
};
