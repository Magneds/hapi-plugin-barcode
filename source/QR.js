const { qrcode } = require('pure-svg-code');
const defaults = {
	content: '',
	padding: 4,
	width: 256,
	height: 256,
	color: 'currentColor',
	background: 'transparent',
	ecl: 'H',
};

/**
 * Determine the correct "opposite" dimension in case only one of width or height is provided
 *
 * @param   {object} options
 * @returns {object} options
 */
function ratio(options) {
	const { width, height } = options;

	if ((width || height) && !(width && height)) {
		if (width) {
			options.height = width;
		}
		if (height) {
			options.width = height;
		}
	}

	return options;
}

module.exports = (input) => new Promise((resolve, reject) => {
	const options = { ...defaults, ...ratio(input) };
	const svg = qrcode(options);

	if (svg) {
		return resolve(svg);
	}

	return reject({ message: 'Invalid QR-code content', code: 400 });
});