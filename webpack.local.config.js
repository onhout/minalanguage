const path = require("path");
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: __dirname,

    entry: {
        main: ['main/js/main'],
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
        publicPath: '/static/dist/',
        chunkFilename: '[id]-[hash].chunk.js',
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
        new webpack.optimize.CommonsChunkPlugin({name: 'vendor', filename: 'vendor-[hash].js', Infinity}),
    ],

    devtool: 'cheap-module-source-map',

    module: {
        rules: [
            {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'}, // to transform JSX into JS
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract({fallback: "style-loader", use: "css-loader!less-loader"})
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