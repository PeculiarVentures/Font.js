import { SeqStream } from "bytestreamjs";

export function unicodePointsToCodePoints(unicodePoints: number[], utf16 = true, be = true, includeBOM = true): number[] {
	//#region Initial variables
	const codePoints: number[] = [];
	const dataView = new DataView((new Uint8Array(unicodePoints)).buffer);

	const step = (utf16) ? 2 : 4;
	const flag = !be;

	let start = 0;

	if (includeBOM)
		start = (utf16) ? 2 : 4;
	//#endregion

	//#region Get code points
	for (let i = start; i < dataView.byteLength; i += step) {
		if (utf16) {
			codePoints.push(dataView.getUint16(i, flag));
		} else {
			codePoints.push(dataView.getUint32(i, flag));
		}
	}
	//#endregion

	return codePoints;
}

export function stringToCodePoints(str: string, utf16 = true, be = true, includeBOM = true): number[] {
	//#region Initial variables
	const result: number[] = [];
	//#endregion

	//#region Set correct BOM (Byte Order Mark) value
	if (includeBOM) {
		switch (true) {
			case (utf16 && be): // UTF-16BE
				result.push(0xFE);
				result.push(0xFF);
				break;
			case (utf16 && !be): // UTF-16LE
				result.push(0xFF);
				result.push(0xFE);
				break;
			case (!utf16 && be): // UTF-32BE
				result.push(0x00);
				result.push(0x00);
				result.push(0xFE);
				result.push(0xFF);
				break;
			case (!utf16 && !be): // UTF-32LE
				result.push(0xFF);
				result.push(0xFE);
				result.push(0x00);
				result.push(0x00);
				break;
		}
	}
	//#endregion

	//#region Set codepoints in a correct order
	for (const ch of str) {
		for (let i = 0; i < ch.length; i++) {
			const codeView = new Uint8Array((new Uint32Array([ch.codePointAt(i) || 0])).buffer); // new Uint8Array([undefined]) = Uint8Array(1) [ 0 ]

			if (!utf16 && !be)
				result.push(...codeView);
			else {
				if (!utf16) {
					result.push(codeView[3]);
					result.push(codeView[2]);
				}

				if (be) {
					result.push(codeView[1]);
					result.push(codeView[0]);
				} else {
					result.push(codeView[0]);
					result.push(codeView[1]);
				}
			}
		}
	}
	//#endregion

	return result;
}

export function stringToUnicode(str: string, utf16 = true, be = true, includeBOM = true): string {
	return String.fromCodePoint(...stringToCodePoints(str, utf16, be, includeBOM));
}

export function unicodeToString(unicode: string, utf16 = true, be = true, includeBOM = true) {
	const unicodePoints: number[] = [];

	for (let i = 0; i < unicode.length; i++) {
		unicodePoints.push(unicode.charCodeAt(i));
	}

	return String.fromCodePoint(...unicodePointsToCodePoints(unicodePoints, utf16, be, includeBOM));
}

export function stringToUnicodeHex(str: string, utf16 = true, be = true, includeBOM = true) {
	return Array
		.from(stringToCodePoints(str, utf16, be, includeBOM), element => `0${element.toString(16)}`.slice(-2))
		.join("")
		.toUpperCase();
}

export function unicodeHexToString(unicode: string, utf16 = true, be = true, includeBOM = true) {
	const unicodePoints = [];

	for (let i = 0; i < unicode.length; i += 2)
		unicodePoints.push(parseInt(unicode.slice(i, i + 2), 16));

	return String.fromCodePoint(...unicodePointsToCodePoints(unicodePoints, utf16, be, includeBOM));
}

export function getLongDateTime(stream: SeqStream) {
	stream.getUint32(); // Consider first part to be zero in a nearest future
	const part2 = stream.getUint32();

	return new Date((part2 - 2082844800) * 1000);
}

export function appendLongDateTime(date: Date, stream: SeqStream): void {
	stream.appendUint32(0);
	stream.appendUint32((date.getTime() / 1000) + 2082844800);
}

export function getF2Dot14(stream: SeqStream): number {
	const value = stream.getInt16();

	return (value / 16384);
}

export function appendF2Dot14(value: number, stream: SeqStream): void {
	stream.appendInt16(value * 16384);
}

export function checkFlag(flag: number, mask: number) {
	return ((flag & mask) === mask);
}

/**
 * 16.16-bit signed fixed-point number
 */
export type Fixed = number;

const point = 1 << (32 >> 1);

export function getFixed(stream: SeqStream): number {
	return stream.getInt32() / point;
}

export function appendFixed(value: number, stream: SeqStream): void {
	stream.appendInt32(value * point);
}


