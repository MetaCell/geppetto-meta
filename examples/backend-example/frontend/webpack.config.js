const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

let geppettoConfig;
try {
  geppettoConfig = require('./GeppettoConfiguration.json');
  console.log('\nLoaded Geppetto config from file');
} catch (e) {
  // Failed to load config file
  console.error('\nFailed to load Geppetto Configuration')
}
const geppetto_client_path = 'node_modules/@metacell/geppetto-meta-client'
const publicPath = path.join(geppettoConfig.contextPath, "geppetto/build/");
console.log("\nThe public path (used by the main bundle when including split bundles) is: " + publicPath);

const copyPaths = [
  { from: path.resolve(__dirname, "src/assets"), to: 'assets' },
];

module.exports = function webpacking (envVariables) {
  let env = envVariables;
  if (!env) {
    env = {};
  }
  if (!env.mode) {
    env.mode = 'production';
  }
  if (env.contextPath) {
    geppettoConfig.contextPath = env.contextPath;
  }
  if (env.useSsl) {
    geppettoConfig.useSsl = JSON.parse(env.useSsl);
  }
  if (env.noTest) {
    geppettoConfig.noTest = JSON.parse(env.noTest);
  }
  if (env.embedded) {
    geppettoConfig.embedded = JSON.parse(env.embedded);
  }
  if (env.embedderURL) {
    geppettoConfig.embedderURL = env.embedderURL;
  }


  console.log('####################');
  console.log('####################');
  console.log('BUILD bundle with parameters:');
  console.log( env);
  console.log('####################');
  console.log('####################');
  console.log('Geppetto configuration \n');
  console.log(JSON.stringify(geppettoConfig, null, 2), '\n');
  console.log('####################');
  console.log('####################');

  const { mode } = env;
  const devtool = env.mode === 'source-map';


  const output = {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js'
  };

  const module = {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.ts|tsx?$/,
        loader: "awesome-typescript-loader"
      },
      {
        test: /\.(css)$/,
        use: [
          { loader: "style-loader", },
          { loader: "css-loader", }],
      },
      {
        test: /\.less$/,
        use: [
          { loader: "style-loader", },
          { loader: "css-loader", },
          {
            loader: "less-loader",
            options: { lessOptions: { strictMath: true, }, },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|eot|woff|woff2|svg|ttf)$/,
        loader: 'file-loader'
      },

    ]
  };

  const resolve = {
    extensions: ['*', '.js', '.json', '.ts', '.tsx', '.jsx'],
    alias: {
      root: path.resolve(__dirname),
      geppetto: path.resolve(__dirname, geppetto_client_path),
    },
    symlinks: false
  };


  const plugins = [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({ patterns: copyPaths }),
    new CompressionPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.ejs',
      favicon: path.join(__dirname, 'src/assets/icon.png'),
      filename: 'geppetto.vm',
      GEPPETTO_CONFIGURATION: geppettoConfig,

    })
  ];

  return {
    mode,
    devtool,
    output,
    module,
    resolve,
    plugins
  };
};
