const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const webpack = require('webpack');
const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap({
  entry: './src/index.js',
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: { historyApiFallback: true, hot: true },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.*', '.js', '.json', '.ts', '.tsx', '.jsx'],
    fallback: {
      "fs": false,  // Disable 'fs', remove if not required
      "path": require.resolve("path-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "process": require.resolve("process"),
      "buffer": require.resolve("buffer"),
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?!(@metacell)\/).*/,
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { modules: false }],
            '@babel/preset-react',
            { plugins: ['@babel/plugin-proposal-class-properties'] },
          ],
        },
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.html$/,
        use: [{ loader: 'html-loader' }],
      },
      {
        test: /\.svg$/,
        type: 'asset/resource', // Webpack 5 built-in asset handling
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      {
        test: /\.s[ac]ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|gif|jpg|cur)$/i,
        type: 'asset', // Webpack 5 built-in asset handling
        parser: {
          dataUrlCondition: {
            maxSize: 10000 // 10kb limit for inlining images as Data URLs
          }
        }
      },
      {
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/i,
        type: 'asset/resource', // Webpack 5 built-in asset handling for fonts
      },
      {
        test: /\.(ttf|eot|otf)$/,
        type: 'asset/resource', // Webpack 5 built-in asset handling
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.md$/,
        use: ['html-loader', 'markdown-loader'],
      },
      {
        test: /\.dat$/,
        type: 'asset/source', // Use Webpack's asset/source for raw data
      },
      {
        test: /\.(obj|drc|gltf)$/,
        type: 'asset/resource', // Webpack 5 built-in asset handling for 3D models
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto' // Handle ES modules with .mjs extension
      }
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
      favicon: path.resolve(__dirname, 'node_modules/@metacell/geppetto-meta-client/style/favicon.png'),
    }),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, "./src/examples/3d-canvas/models"), to: "assets" },
        { from: path.resolve(__dirname, "./src/examples/3d-canvas/assets"), to: "assets" },
        { from: path.resolve(__dirname, "./src/examples/list-viewer/instances-small.js"), to: "instances-small.js" },
        { from: path.resolve(__dirname, "./src/examples/connectivity-viewer/model.js"), to: "model.js" },
        { from: path.resolve(__dirname, "./src/examples/plot/model.js"), to: "model.js" },
        { from: path.resolve(__dirname, "./src/examples/menu/model.json"), to: "model.json" },
        { from: path.resolve(__dirname, "./src/examples/vr-canvas/auditory_cortex.json"), to: "auditory_cortex.json" },
      ],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
});