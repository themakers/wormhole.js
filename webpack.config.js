// const webpack = require('webpack');
//
// const {removeEmpty} = require('webpack-config-utils');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const {resolve, join} = require('path');
//
// const config = (env, argv) => {
//   const mode = argv.mode;
//   const isProd = mode === 'production';
//   const ifProd = (whenProd, whenNot) => (isProd ? whenProd : whenNot);
//   return [{
//     entry: [join(__dirname, 'src/index.ts')],
//     // entry: {
//     //   [`index${ifProd('.min', '')}`]: [join(__dirname, '/src/index.ts')],
//     // },
//     output: {
//       path: resolve(__dirname, 'dist', 'umd'),
//       libraryTarget: 'umd',
//       library: 'Wormhole',
//       umdNamedDefine: true
//     },
//     resolve: {
//       extensions: ['.ts'],
//     },
//     optimization: {
//       splitChunks: {
//         chunks: 'all'
//       }
//     },
//     devtool: 'source-map',
//     plugins: removeEmpty([
//       new webpack.optimize.ModuleConcatenationPlugin(),
//       ifProd(
//         new UglifyJsPlugin({
//           sourceMap: true,
//           uglifyOptions: {
//             compress: true,
//             output: {
//               comments: false
//             }
//           }
//         })
//       ),
//       new webpack.DefinePlugin({
//         'process.env': {
//           NODE_ENV: mode
//         },
//       }),
//     ]),
//     module: {
//       rules: [
//         {
//           test: /\.ts?$/,
//           include: /src/,
//           loader: 'awesome-typescript-loader',
//         }
//       ],
//     },
//   }];
// };
//
// module.exports = config;
//
const path = require('path');
const TSLintPlugin = require('tslint-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new TSLintPlugin({
      files: ['./src/**/*.ts']
    })
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build', 'umd'),
    libraryTarget: 'umd',
    library: 'Wormhole',
    libraryExport: 'default',
    umdNamedDefine: true
  },
};
