const path = require("path");
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const S3Plugin = require('webpack-s3-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

require('dotenv').config();

module.exports = {
    context: __dirname,
    mode: 'production',
    entry: {
        main: ['main/js/main', 'main/less/dashboard.less'],
        files: ['main/js/files', 'main/less/files.less'],
        calendar: ['main/js/calendar', 'main/less/calendar.less'],
        outlinetree: ['main/js/outline-tree', 'main/less/outline-tree.less'],
        vendor: [
            'jquery',
            'popper.js',
            'bootstrap',
            'bootstrap-switch',
            'bootstrap-datepicker',
            'nouislider',
            'jquery-ui-dist/jquery-ui',
            'jquery-validation',
            'globals/now-ui-kit.js',
            'globals/index.js',
            'globals/index.less',
            'blueimp-file-upload',
            'lodash',
            'moment',
            'fullcalendar',
            'jquery.fancytree/dist/jquery.fancytree-all.js',
            'jquery-contextmenu'
        ]
    }, // entry point of our app. assets/js/index.js should require other js modules and dependencies it needs

    output: {
        path: path.resolve('./static/dist/'),
        publicPath: 'https://s3-us-west-1.amazonaws.com/minalanguage/dist/',
        filename: "[name]-[hash].js",
    },

    plugins: [
        // new webpack.optimize.UglifyJsPlugin(),
        new BundleTracker({filename: './webpack-stats.json'}),
        new webpack.ProvidePlugin({
            $: 'jquery',             // bootstrap 3.x requires
            jQuery: 'jquery',
            Popper: ['popper.js', 'default'],      // bootstrap 3.x requires
            moment: 'moment',
        }),
        new ExtractTextPlugin('[name]-[hash].css'),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new S3Plugin({
            // Exclude uploading of html
            exclude: /.*\.html$/,
            // s3Options are required
            s3Options: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            },
            s3UploadOptions: {
                Bucket: 'minalanguage'
            },
            basePath: 'dist'
        })
    ],
    optimization: {
        splitChunks: {
            chunks: "async",
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            name: true,
            cacheGroups: {
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                },
                commons: {
                    chunks: 'initial',
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                }
            }
        },
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: false // set to true if you want JS source maps
            }),
            new OptimizeCssAssetsPlugin({})
        ]
    },

    module: {
        rules: [
            {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'}, // to transform JSX into JS
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader!less-loader!resolve-url-loader!less-loader?sourceMap"
                })
            }, //to transform less into CSS
            {test: /\.(jpe|jpg|png|woff|woff2|eot|ttf|gif|svg)(\?.*$|$)/, loader: 'url-loader?limit=100000'},//changed the regex because of an issue of loading less-loader for font-awesome.
            {test: /\.css$/, loader: ExtractTextPlugin.extract({fallback: "style-loader", use: "css-loader"})},
        ],
    },


    resolve: {
        modules: [
            path.resolve('./src'),
            './node_modules'
        ],
        extensions: ['.js', '.jsx']
    },
};