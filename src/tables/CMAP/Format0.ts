import { SeqStream } from "bytestreamjs";
import { Glyph } from "../GLYF/Glyph";
import { CMAPLanguage, CMAPSubTable, CMAPSubTableParameters } from "./CMAPSubTable";

export interface Format0Parameters extends CMAPSubTableParameters {
	format?: 0;
	language?: number;
	glyphIndexArray?: number[];
}

export class Format0 extends CMAPSubTable implements CMAPLanguage {

	public readonly format: 0 = 0;
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
		stream.appendUint16(this.format); // format
		stream.appendUint16(262); // TODO Fixed value? // length
		stream.appendUint16(this.language); // language

		stream.appendView(new Uint8Array(this.glyphIndexArray)); // glyphIdArray[256]

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
