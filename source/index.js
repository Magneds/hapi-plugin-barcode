const SVGCode = require('pure-svg-code');
const Plugin = require('@magneds/hapi-plugin');

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

function unify(options) {
	const map = {
		height: 'barHeight',
		background: 'bgColor',
		text: 'showHRI',
	};

	return Object.keys(options)
		.reduce((carry, key) => ({ ...carry, [key in map ? map[key] : key]: options[key] }), {});
}

const plugin = new Plugin(require('../package.json'));
const defaults = {
	qr: {
		content: '',
		padding: 4,
		width: 256,
		height: 256,
		color: 'currentColor',
		background: 'transparent',
		ecl: 'H',
	},
	barcode: {
		width: '160',
		barWidth: 1,
		barHeight: 50,
		color: 'currentColor',
		bgColor: 'transparent',
		showHRI: false,
	},
};

plugin.name = 'Barcode';
plugin.register = (server) => server.route([
	{
		method: 'GET',
		path: '/barcode/qr/{content}',
		handler(request, h) {
			const { query, params } = request;
			const { content } = params;
			const options = { ...defaults.qr, ...ratio(query), content };
			const svg = SVGCode.qrcode(options);

			console.log(options);

			if (!svg) {
				return h.response('Invalid QR-code content').code(400);
			}

			return h.response(svg).header('content-type', 'image/svg+xml');
		},
	},
	{
		method: 'GET',
		path: '/barcode/{type}/{content}',
		handler(request, h) {
			const { query, params } = request;
			const { type, content } = params;
			const options = { ...defaults.barcode, ...(defaults[type] || {}), ...unify(query) };
			const svg = SVGCode.barcode(content, type, options);

			console.log(options);

			if (!svg) {
				const valid = ['codabar', 'code11', 'code39', 'code93', 'code128', 'ean8', 'ean13', 'std25', 'int25'];
				if (valid.indexOf(type) < 0) {
					return h.response(`Type "${type}" not found`).code(404);
				}

				return h.response(`Invalid ${type} code`).code(400);
			}

			return h.response(svg).header('content-type', 'image/svg+xml');
		},
	},
]);

module.exports = plugin.export;