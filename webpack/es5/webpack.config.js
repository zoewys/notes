const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const InlineSourceWebpackPlugin = require('inline-source-webpack-plugin')

module.exports = {
    entry: [
        // 打包es5需要
        "@babel/polyfill",
        "./index.js"
    ],
    output: {
        publicPath: '',
        filename: "bundle.js",
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    devtool: 'inline-source-map',
    // 外层打包es5
    target: ['web', 'es5'],
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            inject: true,
            template: 'index.html'
        }),
        new InlineSourceWebpackPlugin({
            compress: true,
            rootpath: './',
            noAssetMatch: 'warn'
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test:  /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        // 编译到es5
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ],
    },
}
