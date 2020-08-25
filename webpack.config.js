const HtmlWebPackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './geppetto-showcase/index.js'),
  mode: 'development',
  devtool: 'inline-source-map',
  node: {
    fs: 'empty',
  },
  resolve: {
    alias: {
      '@geppettoengine/geppetto-client': path.resolve(
        __dirname,
        './geppetto-client/geppetto-client/js'
      ),
      '@geppettoengine/geppetto-core': path.resolve(
        __dirname,
        './geppetto-client/geppetto-core/src'
      ),
      '@geppettoengine/geppetto-ui': path.resolve(
        __dirname,
        './geppetto-client/geppetto-ui/src'
      ),
    },
    extensions: ['*', '.js', '.json', '.ts', '.tsx', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: [
            ['@babel/preset-env', { modules: false }],
            '@babel/preset-react',
            { plugins: ['@babel/plugin-proposal-class-properties'] },
          ],
        },
      },
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
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
        loader: 'style-loader!css-loader!less-loader',
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
        loader: 'style-loader!css-loader',
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
            options: {
              esModule: false,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './geppetto-showcase/index.html',
      filename: './index.html',
      favicon: './geppetto-client/geppetto-client/style/favicon.png',
    }),
  ],
};
