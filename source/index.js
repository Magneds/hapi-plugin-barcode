const SVGCode = require('pure-svg-code');
const Plugin = require('@magneds/hapi-plugin');

const plugin = new Plugin(require('../package.json'));
const defaults = {
	qr: {
		content: '',
		padding: 4,
		width: 256,
		height: 256,
		color: 'currentColor',
		background: 'transparent',
		ecl: 'M',
	},
	barcode: {
		width: '160',
		barWidth: 1,
		barHeight: 50,
		showHRI: false,
	},
};

plugin.name = 'Barcode';
plugin.register = (server) => server.route([
	{
		method: 'GET',
		path: '/barcode/qr/{content}',
		handler(request, h) {
			const { content } = request.params;
			const svg = SVGCode.qrcode({ ...defaults.qr, ...request.query, content });

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
			const { type, content } = request.params;
			const options = { ...defaults.barcode, ...(defaults[type] || {}), ...request.query };
			const svg = SVGCode.barcode(content, type, options);

			if (!svg) {
				return h.response(`Invalid ${type} code`).code(400);
			}

			return h.response(svg).header('content-type', 'image/svg+xml');
		},
	},
]);

module.exports = plugin.export;