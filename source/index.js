const Plugin = require('@magneds/hapi-plugin');
const QR = require('./QR.js');
const Barcode = require('./Barcode.js');
const plugin = new Plugin(require('../package.json'));

plugin.name = 'barcode';
plugin.prefix = '/barcode';
plugin.register = (server) =>
	server.route([
		{
			method: 'GET',
			path: '/{type}/{content}',
			async handler(request, h) {
				const { query, params } = request;
				const { type } = params;
				const renderer = /^qr$/.test(type) ? QR : Barcode;

				return renderer({ ...query, ...params })
					.then((svg) =>
						h.response(svg).header('content-type', 'image/svg+xml')
					)
					.catch(({ code, message }) =>
						h.response(message).code(code)
					);
			}
		}
	]);

module.exports = plugin.exports;
