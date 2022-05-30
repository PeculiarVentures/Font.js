# Font.js (FontJS)

[![Node.js CI](https://github.com/PeculiarVentures/Font.js/actions/workflows/test.yml/badge.svg)](https://github.com/PeculiarVentures/Font.js/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/PeculiarVentures/Font.js/badge.svg?branch=typescript)](https://coveralls.io/github/PeculiarVentures/Font.js?branch=typescript)
[![npm version](https://badge.fury.io/js/fontjs.svg)](https://badge.fury.io/js/fontjs)

Font.js (FontJS) is library helping parse/encode and manipulate TrueType font files. In a future there is a plan to extend support to OpenType fonts as well.

## Example
```javascript
import * as fontjs from "fontjs";
import { SeqStream, ByteStream } from "bytestreamjs";

async function fontTest()
{
	const fontFetchResult = await fetch("./fonts/times.ttf");
	const fontFetchBuffer = await fontFetchResult.arrayBuffer();

	const font = fontjs.Font.fromStream(new SeqStream({ stream: new ByteStream({ buffer: fontFetchBuffer }) }));

	const fontStream = new SeqStream();

	const toStreamResult = font.toStream(fontStream);
}
```

## Related

- [TrueType Reference Manual](https://developer.apple.com/fonts/TrueType-Reference-Manual/)
- [OpenType Specification](https://docs.microsoft.com/en-us/typography/opentype/spec/)