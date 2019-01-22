const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    index: ['babel-polyfill', './src/ui/Index.jsx'],
  },
  output: {
    path: path.join(__dirname, 'static/assets'),
    filename: '[name].js',
    publicPath: '/assets/',
  },
  resolve: {
    modules: [__dirname, 'node_modules'],
    extensions: ['.js', '.jsx'],
    alias: {
      react: path.join(__dirname, 'node_modules', 'react'),
      'react-dom': path.join(__dirname, 'node_modules', 'react-dom'),
    },

  },
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader?importLoaders=1' },
            { loader: 'postcss-loader?sourceMap' },
            { loader: 'resolve-url-loader' },
            { loader: 'sass-loader?sourceMap', options: { includePaths: ['./node_modules'] }},
          ],
          publicPath: '/assets/',
        }),
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader' },
            {
              loader: 'less-loader',
              options: {
                javascriptEnabled: true,
              },
            },
          ],
          publicPath: '/assets/',
        }),
      },
      { test: /\.woff2?$/, loader: 'url-loader?limit=100&minetype=application/font-woff' },
      { test: /\.(otf|ttf|eot|mp4|webm|ogv)?$/, loader: 'file-loader?name=[name]-[hash:6].[ext]' },
      {
        test: /\.(svg|png|jpg|jpeg)?$/,
        use: [
          { loader: 'file-loader?name=[name]-[hash:6].[ext]' },
          { loader: 'image-webpack-loader' },
        ],
      },
    ],
  },
};
