const path = require('path');

module.exports = {
  entry: './src/app.ts',
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  }
};