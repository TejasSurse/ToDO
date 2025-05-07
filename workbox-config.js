module.exports = {
	globDirectory: './',
	globPatterns: [
		'**/*.{js,html,css,jpg}'
	],
	swDest: 'sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};