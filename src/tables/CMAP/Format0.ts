import { SeqStream } from "bytestreamjs";
import { Glyph } from "../GLYF/Glyph";
import { CMAPSubTable, CMAPSubTableParameters } from "./CMAPSubTable";

export interface Format0Parameters extends CMAPSubTableParameters {
	language?: number;
	glyphIndexArray?: number[];
}

export class Format0 extends CMAPSubTable {

	public language: number;
	public glyphIndexArray: number[];

	constructor(parameters: Format0Parameters = {}) {
		super(parameters);

		this.language = parameters.language || 0;
		this.glyphIndexArray = parameters.glyphIndexArray || [];
	}

	static get className() {
		return "Format0";
	}

	public toStream(stream: SeqStream): boolean {
		stream.appendUint16(0); // CMAP format
		stream.appendUint16(262);
		stream.appendUint16(this.language);

		stream.appendView(new Uint8Array(this.glyphIndexArray));

		return true;
	}

	public static fromStream(stream: SeqStream) {
		stream.getUint16(); // length
		const language = stream.getUint16();

		const glyphIndexArray: number[] = [];

		for (let j = 0; j < 256; j++) {
			const glyphIndex = (stream.getBlock(1))[0];
			glyphIndexArray.push(glyphIndex);
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
		return new Format0();
	}

}
