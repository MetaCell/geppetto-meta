const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require('path');

module.exports = {
    entry: path.resolve(__dirname,"./geppetto-showcase/index.js"),

    resolve:{
        alias:{
            "@geppettoengine/geppetto-client": path.resolve(__dirname,"./geppetto-client")
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: { presets: [['@babel/preset-env', { "modules": false }], '@babel/preset-react'] }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader"
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./geppetto-showcase/index.html",
            filename: "./index.html"
        })
    ]
};