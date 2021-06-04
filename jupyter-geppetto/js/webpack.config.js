const path = require('path');

var rules = [
    { test: /\.less$/, use: [{loader: "style-loader"}, {loader: "css-loader" }, {loader: "less-loader" }]},
];
module.exports = [
    {
        entry: './src/index.js',
        output: {
            filename: 'index.js',
            //FIXME: Move to static folder
            path: path.resolve(__dirname, '../jupyter_geppetto'),
            libraryTarget: 'amd'
        },
        module: {
            rules: rules
        }
    }
];