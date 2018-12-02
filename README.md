# Hapi Barcode Plugin

Generate bar-/QR codes on the fly from a webserver running Hapi

## Installation

```
$ npm install --save @magneds/hapi-plugin-barcode
```

## Usage

As the name might have suggested already, this package is a plugin for the Hapi framework, simply registering the package as plugin will suffice.

### Using `@magneds/hapi-server`

```js
const HapiServer = require('@magneds/node-hapi-server');
const HapiPluginBarcode = require('@magneds/hapi-plugin-barcode');

new HapiServer()
	.configure({ host: 'localhost', port: 3000 })
	.plugin(HapiPluginBarcode)
	.start()
	.then(() => console.log(`Running @${server.info.uri}`));
```

### Using `hapi`

```js
const Hapi = require('hapi');
const HapiPluginBarcode = require('@magneds/hapi-plugin-barcode');

const server = Hapi.server({ host: 'localhost', port: 3000 });

const init = async () => {
	await server.register(HapiPluginBarcode);
	await server.start();

	console.log(`Running @${server.info.uri}`);
};

init();
```

## API

The barcode plugin registers two routes to do all the heavy lifting, for the examples below we'll assume the routes are not prefixed to reside in another location.

### `/barcode/qr/{content}`

Generate a QR code with the data provided in `{content}`.
Note that as the content is part of the path, the data must be properly url encoded (e.g. using [JavaScript `encodeURIComponent`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent), [PHP `urlencode`](http://php.net/manual/en/function.urlencode.php), or the equivalent in your favorite language)

```
http://localhost:3000/barcode/qr/hello%20world
```

#### Parameters

There are several settings that can be overridden, all of these can be provided as query parameters.

```
http://localhost:3000/barcode/qr/hello%20world?background=%23f90&color=red&width=1000&ecl=Q
```

| option     | default      | description            | note                                                                                               |
| ---------- | ------------ | ---------------------- | -------------------------------------------------------------------------------------------------- |
| padding    | 4            | white space padding    | 0 for no padding                                                                                   |
| width      | 256          | width in pixels        | if no height is specified, it will be set to width                                                 |
| height     | 256          | height in pixels       | if no width is specified, it will be set to height                                                 |
| color      | currentColor | foreground color       | any valid CSS color value (remember # has a special meaning in URLs so it must be escaped (`%23`)) |
| background | transparent  | background color       | any valid CSS color value (remember # has a special meaning in URLs so it must be escaped (`%23`)) |
| ecl        | H            | error correction level | L, M, H, Q                                                                                         |

### `/barcode/{type}/{content}`

Generate a barcode of `{type}` with the specified data provided in `{content}`

#### Valid types

| type    | description                                                                                         |
| ------- | --------------------------------------------------------------------------------------------------- |
| codabar | [Codabar](https://en.wikipedia.org/wiki/Codabar)                                                    |
| code11  | [Code 11](https://en.wikipedia.org/wiki/Code_11)                                                    |
| code39  | [Code 39](https://en.wikipedia.org/wiki/Code_39)                                                    |
| code93  | [Code 93](https://en.wikipedia.org/wiki/Code_93)                                                    |
| code128 | [Code 128](https://en.wikipedia.org/wiki/Code_128)                                                  |
| ean8    | [EAN 8](https://en.wikipedia.org/wiki/EAN-8)                                                        |
| ean13   | [EAN 13](https://en.wikipedia.org/wiki/International_Article_Number) (International Article Number) |
| std25   | [Standard 2 of 5](https://en.wikipedia.org/wiki/Two-out-of-five_code) (Industrial 2 of 5)           |
| int25   | [Interleaved 2 of 5](https://en.wikipedia.org/wiki/Interleaved_2_of_5)                              |

Specifying any invalid type will result in a `404 - Type "${type}" not found` response

#### Parameters

There are several settings that can be overridden, all of these can be provided as query parameters.

```
http://localhost:3000/barcode/code39/123456789098?height=30&color=red
```

| option     | default      | description              | note                                                                                               |
| ---------- | ------------ | ------------------------ | -------------------------------------------------------------------------------------------------- |
| width      | 160          | width in pixels          |
| height     | 50           | (bar) height in pixels   |
| color      | currentColor | foreground color         | any valid CSS color value (remember # has a special meaning in URLs so it must be escaped (`%23`)) |
| background | transparent  | background color         | any valid CSS color value (remember # has a special meaning in URLs so it must be escaped (`%23`)) |
| text       | false        | include the code as text | not as pretty as one might expect                                                                  |
