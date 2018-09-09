const path = require("path");
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    context: __dirname,
    mode: 'development',
    entry: {
        vendor: [
            'jquery',
            'popper.js',
            'bootstrap',
            'bootstrap-switch',
            'bootstrap-datepicker',
            'nouislider',
            'jquery-ui-dist/jquery-ui',
            'jquery-validation',
            'blueimp-file-upload',
            'lodash',
            'moment',
            'fullcalendar',
            'jquery.fancytree/dist/jquery.fancytree-all.js',
            'jquery-contextmenu',
            'globals/now-ui-kit.js',
            'globals/index.js',
            'globals/index.less'
        ]

    }, // entry point of our app. assets/js/index.js should require other js modules and dependencies it needs

    output: {
        path: path.resolve('./static/dist/'),
        publicPath: '/static/dist/',
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
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(), //VERY IMPORTANT, instead of using HOT in server.js
        new CleanWebpackPlugin('./static/'),
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
        }
    },

    devtool: 'cheap-module-source-map',

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
            {test: /\.css$/, loader: ExtractTextPlugin.extract({fallback: "style-loader", use: "css-loader"}) },
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