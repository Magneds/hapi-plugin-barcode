const { barcode } = require('pure-svg-code');
const defaults = {
	width: '160',
	barWidth: 1,
	barHeight: 50,
	color: 'currentColor',
	bgColor: 'transparent',
	showHRI: false
};

/**
 * Unify the parameters for the barcode plugin
 *
 * @param   {object} options
 * @returns {object} options
 */
function unify(options) {
	const map = {
		height: 'barHeight',
		background: 'bgColor',
		text: 'showHRI'
	};

	return Object.keys(options).reduce(
		(carry, key) => ({
			...carry,
			[key in map ? map[key] : key]: options[key]
		}),
		{}
	);
}

module.exports = (input) =>
	new Promise((resolve, reject) => {
		const options = { ...defaults, ...unify(input) };
		const { content, type } = input;
		const svg = barcode(content, type, options);

		if (svg) {
			return resolve(svg);
		}

		const valid = [
			'codabar',
			'code11',
			'code39',
			'code93',
			'code128',
			'ean8',
			'ean13',
			'std25',
			'int25'
		];

		if (valid.indexOf(type) < 0) {
			return reject({ message: `Type "${type}" not found`, code: 404 });
		}

		return reject({ message: `Invalid ${type} code`, code: 400 });
	});
