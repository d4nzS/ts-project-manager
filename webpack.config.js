const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const filename = (name, ext) => `${name}.[contenthash].${ext}`;

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: './app.ts',
  output: {
    filename: filename('bundle', 'js'),
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HTMLWebpackPlugin({
      template: './index.html',
      minify: {
        collapseWhitespace: isProd
      }
    }),
    new MiniCSSExtractPlugin({
      filename: filename('app', 'css')
    })
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
           MiniCSSExtractPlugin.loader,
          'css-loader'
        ],
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};