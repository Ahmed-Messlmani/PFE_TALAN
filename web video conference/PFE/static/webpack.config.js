const path = require('path');

module.exports = {
  entry: {
    'index': path.resolve(__dirname, 'js/index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      }
    ]
  },
};
