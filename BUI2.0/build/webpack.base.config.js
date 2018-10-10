'use strict'
const path = require('path');

function resolve(dir) {
    return path.join(__dirname, "../", dir);
}

module.exports = {
    context: path.resolve(__dirname, '../src'),
    entry: {
        app: './app.js',
        bui: './core/bui.js'
    },
    resolve: {
        extensions: ['.js', '.css'],
        alias: {
            "~": resolve("src")
        }
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: "html-loader"
            },
            {
                test: /\.js$/,
                loader: 'babel-loader'
            },
            {
                test: "/\.css$/",
                use: [
                    'style-loader',
                    { loader: 'css-loader', options: { sourceMap: true } }
                ]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    { loader: 'css-loader', options: { sourceMap: true, importLoaders: 1 } },
                    { loader: 'less-loader', options: { sourceMap: true } }
                ]
            }
        ]
    }
};