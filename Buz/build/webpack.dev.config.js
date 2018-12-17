const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.config');
const config = require('./config');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const portfinder = require('portfinder');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const devWebpackConfig = merge(baseWebpackConfig, {
    output: {
        path: config.dev.assetsRoot,
        filename: '[name].js',
        publicPath: "/"
    },
    devtool: config.dev.devtool,
    //https://webpack.js.org/configuration/dev-server/
    devServer: {
        //可能的值有 none, error, warning 或者 info（默认值）。
        clientLogLevel: 'error',
        //热模块更新作用
        hot: true,
        //代码进行压缩
        compress: true,
        contentBase: false,
        host: config.dev.host,
        port: config.dev.port,
        open: config.dev.autoOpenBrowser,
        overlay: config.dev.errorOverlay,
        proxy: config.dev.proxyTable,
        publicPath: '/',
        //是否只输入默认信息在控制台（不包括错误和警告）
        quiet: true,
        //是否启用文件监听修改
        watchOptions: {
            poll: false
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            "process": require('./options/devConfig')
        }),
        //模块热替换
        new webpack.HotModuleReplacementPlugin(),
        //当开启 HMR 的时候使用该插件会显示模块的相对路径，建议用于开发环境
        new webpack.NamedModulesPlugin(),
        //在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。这样可以确保输出资源不会包含错误
        new webpack.NoEmitOnErrorsPlugin(),
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
                to: config.dev.staticDir
            }
        ])
    ]
});

module.exports = new Promise((resolve, reject) => {
    portfinder.basePort = config.dev.port;
    portfinder.getPort((error, port) => {
        if (error) return reject(error);

        devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
            compilationSuccessInfo: {
                messages: [`启动完成，地址为: http://${devWebpackConfig.devServer.host}:${port}`],
            },
            onErrors: undefined
        }));

        resolve(devWebpackConfig)
    });
});