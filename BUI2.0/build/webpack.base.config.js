'use strict'
const path = require('path');

function resolve(dir) {
    return path.join(__dirname, "../", dir);
}

module.exports = {
    context: path.resolve(__dirname, '../src'),
    entry: {
        app: './app.js',
        bui: './bui/bui.js'
    },
    resolve: {
        alias: {
            "@": resolve("src")
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
            }
        ]
    }
};