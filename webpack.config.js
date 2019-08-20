const path = require('path');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/assets',
    library: 'cushiondb-client',
    libraryExport: 'default',
    libraryTarget: 'umd'
  },
  entry: {
    main: './src/index.js',
    cushionWorker: './src/cushion_worker/cushionWorkerIndex.js'
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
