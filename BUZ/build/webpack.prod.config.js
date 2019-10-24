const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.config');
const config = require('./config');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(baseWebpackConfig, {
    output: {
        path: config.prod.assetsRoot,
        filename: '[name].js',
        chunkFilename: '[name].js',
        publicPath: "/"
    },
    devtool: config.prod.devtool,
    optimization:{
        moduleIds: 'hashed'
    },
    plugins: [
        new webpack.DefinePlugin({
            "process": require('./options/devConfig')
        }),
        //在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。这样可以确保输出资源不会包含错误
        new webpack.NoEmitOnErrorsPlugin(),
        // 清理文件
        new CleanWebpackPlugin(),
        // 到处依赖图
        new BundleAnalyzerPlugin(),
        // https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: "head"
        }),
        //copy静态资源
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../src/static'),
                to: config.prod.staticDir
            }
        ])
    ]
});
