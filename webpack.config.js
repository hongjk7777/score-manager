const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const nodeExternals = require('webpack-node-externals');

const config = {
    // entry: ['./src/public/views/js/class.js', './src/public/views/js/classList.js', './src/public/views/js/examInfo.js',
    // './src/public/views/js/examList.js','./src/public/views/js/nav.js','./src/public/views/js/settings.js'],
    entry: {
        main: ['./src/server.js'],
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'index_bundle.js',
    },
    plugins: [
      new HtmlWebpackPlugin(
        {
          template: path.join(__dirname, 'src/public/views/pug/home.pug'),
          filename: 'index.html',
        }
      ),
      new MiniCssExtractPlugin()
    ],
    target: 'node',
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    externalsPresets: {
        node: true // in order to ignore built-in modules like path, fs, etc. 
    },
    module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules|pages)/,
            use: {
              loader: 'babel-loader',
            },
          },
          {
            test: /\.css$/,
            use: [
              { loader: MiniCssExtractPlugin.loader },
              {
                loader: 'css-loader',
                options: { import: true },
              },
            ],
          },
          {
            test: /\.pug$/,
            loader: '@webdiscus/pug-loader',
          },
        ],
      },
};

module.exports = config;


//version 1

// const path = require('path');
// const PugPlugin = require('pug-plugin');

// module.exports = {
//   output: {
//     path: path.join(__dirname, 'build/public/views/pug'),
//     publicPath: '/', // must be defined any path, `auto` is not supported
//     // output filename of JS files
//     filename: '../js/[name].[contenthash:8].js'
//   },

//   entry: {
//     // all scripts and styles can be used in Pug,
//     // do not need to define JS and SCSS in the webpack entry

//     // define Pug files in entry:
//     index: './src/public/views/pug/index.pug',      // output index.html
//     class: './src/public/views/pug/admin-class/class.pug',
//     exam: './src/public/views/pug/admin-class/exam.pug',
//     student: './src/public/views/pug/admin-class/student.pug',
//     exam_info: './src/public/views/pug/class/exam-info.pug',
//     exam_list: './src/public/views/pug/class/exam-list.pug',
//     score_rule: './src/public/views/pug/class/score-rule.pug',
//     add_class: './src/public/views/pug/classList/add-class.pug',
//     classes: './src/public/views/pug/classList/classes.pug',
//     // class_layout: './src/public/views/pug/layout/class-layout.pug',
//     // class_list_layout: './src/public/views/pug/layout/class-list-layout.pug',
//     // footer: './src/public/views/pug/layout/footer.pug',
//     // header: './src/public/views/pug/layout/header.pug',
//     // layout: './src/public/views/pug/layout/layout.pug',
//     // nav_header: './src/public/views/pug/layout/nav-header.pug',
//     // nav: './src/public/views/pug/layout/nav.pug',
//     // account: './src/public/views/pug/settings/account.pug',
//     profile: './src/public/views/pug/settings/profile.pug',
//     // security: './src/public/views/pug/settings/security.pug',
//     login: './src/public/views/pug/signform/login.pug',
//     signup: './src/public/views/pug/signform/signup.pug',
//     // ...
//   },

//   plugins: [
//     // enable processing of Pug files from entry
//     new PugPlugin({
//       modules: [
//         // module extracts CSS from style source files required in Pug
//         PugPlugin.extractCss({
//           // output filename of CSS files
//           filename: '../css/[name].[contenthash:8].css'
//         })
//       ]
//     })
//   ],

//   module: {
//     rules: [
//       {
//         test: /\.pug$/,
//         loader: PugPlugin.loader, // PugPlugin already contain the pug-loader
//         options: {
//           method: 'render', // fastest method to generate static HTML files
//         }
//       },
//       {
//         test: /\.(css|sass|scss)$/,
//         use: ['css-loader', 'sass-loader']
//       },
//     ],
//   },
// };

// version 2

// const path = require("path");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// const config = {
//     // entry: ['./src/public/views/js/class.js', './src/public/views/js/classList.js', './src/public/views/js/examInfo.js',
//     // './src/public/views/js/examList.js','./src/public/views/js/nav.js','./src/public/views/js/settings.js'],
//     entry: {
//         main: ['./src/public/views/pug/home.pug'],
//     },
//     output: {
//         path: path.resolve(__dirname, 'dist'),
//         filename: 'index.html',
//         clean: true
//     },
//     module: {
//         rules: [
//           {
//             test: /\.js$/,
//             exclude: /(node_modules|pages)/,
//             use: {
//               loader: 'babel-loader',
//             },
//           },
//           {
//             test: /\.css$/,
//             use: [
//               { loader: MiniCssExtractPlugin.loader },
//               {
//                 loader: 'css-loader',
//                 options: { import: true },
//               },
//             ],
//           },
//           {
//             test: /\.png$/,
//             type: 'asset/resource',
//           },
//           {
//             test: /\.pug$/,
//             use: ['pug-loader']
//           }
//         ],
//       },
//       plugins: [new HtmlWebpackPlugin({ template: './src/public/views/pug/home.pug' }), new MiniCssExtractPlugin()]
// };

// module.exports = config;