const path = require('path');

module.exports = {
    dev: {
        /**
        是否以及如何源地图生成，多种生成方案
        参考https://webpack.js.org/configuration/devtool/#development
        **/
        devtool: 'cheap-module-eval-source-map',
        /**服务器host，默认为localhost**/
        host: '',
        //服务器端口
        port: 8080,
        //默认是否打开浏览器
        autoOpenBrowser: true,
        //是否开启错误遮罩，并提示错误堆栈
        errorOverlay: { warnings: false, errors: true },
        /**
         * 是否开启服务代理，并设置代理规则
         * '请求代理规则': {
                target: 'http://0.0.0.0:8888',
                changeOrigin: true
            }
         **/
        proxyTable: undefined,
        /**静态资源目录*/
        staticDir: "static",
        /**资源目录/输出目录 */
        assetsRoot: path.resolve(__dirname, '../dist')

    }
};