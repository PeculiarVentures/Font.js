import { SeqStream } from "bytestreamjs";
import { Glyph } from "../GLYF/Glyph";
import { CMAPLanguage, CMAPSubTable, CMAPSubTableParameters } from "./CMAPSubTable";

export interface Format0Parameters extends CMAPSubTableParameters {
	language?: number;
	glyphIndexArray?: number[];
}

/**
 * Representation of Format 0. Byte encoding table
 * @see https://docs.microsoft.com/en-us/typography/opentype/spec/cmap#format-0-byte-encoding-table
 */
export class Format0 extends CMAPSubTable implements CMAPLanguage {

	/**
	 * Format number is set to 0
	 */
	public get format(): 0 {
		return 0;
	}
	public language: number;
	/**
	 * An array that maps character codes to glyph index values
	 */
	public glyphIndexArray: number[];

	constructor(parameters: Format0Parameters = {}) {
		super(parameters);

		this.language = parameters.language || 0;
		this.glyphIndexArray = parameters.glyphIndexArray || [];
	}

	public static get className() {
		return "Format0";
	}

	public toStream(stream: SeqStream): boolean {
		stream.appendUint16(this.format); // format
		stream.appendUint16(262); // length (format(2) + length(2) + language(2) + glyphIdArray[256])
		stream.appendUint16(this.language); // language

		stream.appendView(new Uint8Array(this.glyphIndexArray)); // glyphIdArray[256]

		return true;
	}

	public static fromStream(stream: SeqStream) {
		const length = stream.getUint16(); // length
		const language = stream.getUint16(); // language

		const glyphIndexArraySize = length - 6;
		const glyphIndexArray: number[] = [];

		// The glyph set is limited to 256.
		// Note that if this format is used to index into a larger glyph set,
		// only the first 256 glyphs will be accessible.
		for (let j = 0; j < glyphIndexArraySize; j++) {
			const glyphIndex = (stream.getBlock(1))[0];
			if (j < 256) {
				glyphIndexArray.push(glyphIndex);
			}
		}

		return new Format0({
			language,
			glyphIndexArray
		});
	}

	/**
	 * Make Format0 table directly from array of code points
	 * @param language
	 * @param glyphs Array of glyphs
	 */
	static fromGlyphs(language: number, glyphs: Glyph[]) {
		return new Format0({
			language,
			// TODO glyphIndexArray: ???
		});
	}

}
