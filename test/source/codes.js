const Hapi = require('@hapi/hapi');
const HapiServer = require('@magneds/hapi-server');
const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { experiment, beforeEach, test } = (exports.lab = Lab.script());

const HapiPluginBarcode = require('../../source');

function query(obj) {
	const string = Object.keys(obj)
		.reduce(
			(carry, key) =>
				carry.concat(
					encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])
				),
			[]
		)
		.join('&');

	return string ? `?${string}` : '';
}

const experiments = [
	{
		title: 'Hapi',
		start: async (...plugins) => {
			const server = Hapi.server();

			const init = async () => {
				await server.register(plugins);
				await server.start();
			};

			await init();

			return server;
		}
	},
	{
		title: 'HapiServer',
		start: async (...plugins) =>
			await new HapiServer().plugin(plugins).start()
	}
];

experiments.forEach((exp) => {
	const { register, tests } = require('../tests.json');
	const { title, start } = exp;
	experiment(title, () => {
		const { register, tests } = require('../tests.json');

		register.forEach((reg) => {
			experiment(`${reg.description} (${reg.prefix})`, () => {
				const plugin =
					reg.prefix === '/barcode'
						? HapiPluginBarcode
						: {
								...HapiPluginBarcode,
								routes: { prefix: reg.prefix }
						  };

				tests.forEach((item) => {
					const param = query(item.params || {});
					const description = [
						item.expect.statusCode !== 200 ? 'erratic' : null,
						item.type,
						'barcode',
						param ? `(${param})` : ''
					]
						.filter((v) => v)
						.join(' ');

					return test(description, { timeout: 10000 }, async () => {
						const server = await start(plugin);

						const response = await server.inject({
							method: 'GET',
							url: `${reg.prefix}/${
								item.type
							}/${encodeURIComponent(item.code)}${param}`
						});

						expect(response).to.be.object();
						expect(response.statusCode).to.equal(
							item.expect.statusCode
						);
						expect(response.headers['content-type']).to.equal(
							item.expect.contentType
						);

						if ('pattern' in item.expect) {
							expect(response.result).to.match(
								new RegExp(item.expect.pattern)
							);
						}

						if (item.expect.body) {
							expect(response.result).to.equal(item.expect.body);
						} else {
							expect(item.expect.body).to.be.null();
							item.expect.body = response.result;
						}

						const post = await server.inject({
							method: 'POST',
							url: `${reg.prefix}/${
								item.type
							}/${encodeURIComponent(item.code)}${param}`
						});

						expect(post.result).to.equal(response.result);
					});
				});
			});
		});
	});
});
