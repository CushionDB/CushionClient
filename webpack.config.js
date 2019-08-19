const path = require('path');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/assets'
  },
  entry: {
    main: './src/index.js',
    cushionWorker: './src/cushion_worker/cushionWorker.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  node: {
    fs: 'empty'
  }
};
