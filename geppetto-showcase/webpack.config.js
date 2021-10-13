const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap({
  entry: './src/index.js',
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: { historyApiFallback: true },
  node: { fs: 'empty', },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'static/js/[name].[contenthash:8].js',
    publicPath: '/'
  },
  resolve: { 
    extensions: ['*', '.js', '.json', '.ts', '.tsx', '.jsx'],
    alias: {
      '@metacell/geppetto-meta-client': path.resolve(__dirname, '../geppetto.js/geppetto-client/src'),
      '@metacell/geppetto-meta-ui': path.resolve(__dirname, '../geppetto.js/geppetto-ui/src'),
      '@metacell/geppetto-meta-core': path.resolve(__dirname, '../geppetto.js/geppetto-core/src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: [
          path.resolve(__dirname, 'src'), 
          path.resolve(__dirname, '../geppetto.js/geppetto-client/src'),
          path.resolve(__dirname, '../geppetto.js/geppetto-ui/src'),
          path.resolve(__dirname, '../geppetto.js/geppetto-core/src'),
        ],
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
        test: /\.html$/,
        use: [{ loader: 'html-loader' }],
      },
      {
        test: /\.svg/,
        use: {
          loader: 'svg-url-loader',
          options: {},
        },
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      {
        test: /\.s[a|c]ss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ],
      },
      {
        test: /\.(png|gif|jpg|cur)$/i,
        loader: 'url-loader',
      },
      {
        test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
        loader: 'url-loader',
        options: { limit: 10000, mimetype: 'application/font-woff2' },
      },
      {
        test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
        loader: 'url-loader',
        options: { limit: 10000, mimetype: 'application/font-woff' },
      },
      {
        test: /\.(ttf|eot|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
        loader: 'file-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.md$/,
        use: [{ loader: 'html-loader' }, { loader: 'markdown-loader' }],
      },
      {
        test: /\.dat$/i,
        use: [
          {
            loader: 'raw-loader',
            options: { esModule: false, },
          },
        ],
      },
      {
        test: /\.obj|\.drc|\.gltf/,
        loader: 'url-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
      favicon: '../geppetto.js/geppetto-client/style/favicon.png',
    }),
    new CopyPlugin(
      {
        patterns: [
          { from: path.resolve(__dirname, "../geppetto.js/geppetto-ui/src/3d-canvas/showcase/models"), to: "assets" },
        ]
      },
    ),
  ],
});
