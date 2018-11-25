const Plugin = require('@magneds/hapi-plugin');
const QR = require('./QR.js');
const Barcode = require('./Barcode.js');
const plugin = new Plugin(require('../package.json'));

plugin.name = 'Barcode';
plugin.register = (server) => server.route([
	{
		method: 'GET',
		path: '/barcode/qr/{content}',
		handler(request, h) {
			const { query, params } = request;

			return QR({ ...query, ...params })
				.then((svg) => h.response(svg).header('content-type', 'image/svg+xml'))
				.catch(({ code, message }) => h.response(message).code(code));
		},
	},
	{
		method: 'GET',
		path: '/barcode/{type}/{content}',
		handler(request, h) {
			const { query, params } = request;

			return Barcode({ ...query, ...params })
				.then((svg) => h.response(svg).header('content-type', 'image/svg+xml'))
				.catch(({ code, message }) => h.response(message).code(code));
		},
	},
]);

module.exports = plugin.export;