# Font.js (FontJS)

Font.js (FontJS) is library helping parse/encode and manipulate TrueType font files. In a future there is a plan to extend support to OpenType fonts as well.

## Example
```javascript
import * as fontjs from "fontjs";
import { SeqStream, ByteStream } from "bytestream";

async function fontTest()
{
	const fontFetchResult = await fetch("./fonts/times.ttf");
	const fontFetchBuffer = await fontFetchResult.arrayBuffer();
	
	const font = fontjs.Font.fromStream(new SeqStream({ stream: new ByteStream({ buffer: fontFetchBuffer }) }));
	
	const fontStream = new SeqStream();
	
	const toStreamResult = font.toStream(fontStream);
}
```