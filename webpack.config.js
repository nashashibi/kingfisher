var path = require('path');
var webpack = require('webpack');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var bootstrapEntryPoints = require('./webpack.bootstrap.config');

var isProd = process.env.NODE_END === 'production';
var bootstrapConfig = isProd ? bootstrapEntryPoints.prod : bootstrapEntryPoints.dev;

var extractCss = new ExtractTextPlugin({
	filename: 'css/main.css'
});

module.exports = {
	entry: {
		app: './src/js/main.js',
		bootstrap: bootstrapConfig
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'js/[name].bundle.js',
        chunkFilename: 'js/[id].bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
				loader: 'babel-loader',
					options: {
						presets: ['env']
					}
				}
			},
			{
				test: /\.scss$/,
				use: extractCss.extract({
					use: ['css-loader?url=false', 'sass-loader']
				})
			},
			{
				test: /\.htmml$/,
				use: ['html-loader']
			},
			{
				test: /\.(jpg|png)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
							outputPath: 'img/',
							publicPath: 'img/'
						}
					}
				]
			},
			{ 
				test: /\.(woff2?|svg)$/, 
				loader: 'url-loader?limit=10000&name=fonts/[name].[ext]'
			},
    		{ 
    			test: /\.(ttf|eot)$/, 
    			loader: 'file-loader?name=fonts/[name].[ext]'
    		}
		]
	},
	plugins: [
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery'
		}),
		extractCss,
		new CopyWebpackPlugin([
            { from:'src/img', to:'img' } 
        ]),
        new HtmlWebpackPlugin({
        	template: 'src/index.html'
        }),
		new UglifyJSPlugin({
			// ...
		}),
        new CleanWebpackPlugin(['dist'])
	]
};