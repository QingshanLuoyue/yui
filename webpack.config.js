var ExtractTextPlugin = require('extract-text-webpack-plugin');
var yui = new ExtractTextPlugin('yui.css');
var webpack = require('webpack');
var path = require('path');

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'build.js',
		path: __dirname + '/build'
	},
	module: {
		loaders: [
			// { test: /\.css$/, loader: 'style!css' },
			{ test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=8192' },
			{ test: /\.scss$/, loader: yui.extract("css!sass") }
		]
	},
	plugins: [
		yui
	]
}