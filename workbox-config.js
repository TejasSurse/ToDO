module.exports = {
	globDirectory: './',
	globPatterns: [
		'**/*.{js,html,json,css,jpg}'
	],
	swDest: 'sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};