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
                query: { presets: [['@babel/preset-env', { "modules": false }], '@babel/preset-react',
                        {'plugins': ['@babel/plugin-proposal-class-properties']}] }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader"
                    }
                ]
            },
            {
                test: /\.svg/,
                use: {
                    loader: 'svg-url-loader',
                    options: {}
                }
            },
            {
                test: /\.less$/,
                loader: 'style-loader!css-loader!less-loader'
            },
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./geppetto-showcase/index.html",
            filename: "./index.html"
        })
    ]
};