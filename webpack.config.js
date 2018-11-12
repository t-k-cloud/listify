var webpack = require('webpack')

/* HTML template engine */
const HtmlWebpackPlugin = require('html-webpack-plugin')

/* vue-loader 15 requires a webpack plugin to function */
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
	entry: { /* required field */
		app: __dirname + '/src/main.js'
	},
	output: { /* required field */
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{ test: /\.vue$/, use: 'vue-loader' }
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			hash: true, /* cache busting */
			template: __dirname + '/src/index-template.html',
			filename: 'index.html' /* default goes to ./dist */
		}),
		new VueLoaderPlugin()
	]
}
