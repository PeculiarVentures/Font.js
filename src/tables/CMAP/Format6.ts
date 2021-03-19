import { SeqStream } from "bytestreamjs";
import { Glyph } from "../GLYF/Glyph";
import { CMAPSubTable, CMAPSubTableParameters } from "./CMAPSubTable";

export interface Format6Parameters extends CMAPSubTableParameters {
	language?: number;
	firstCode?: number;
	glyphIndexArray?: number[];
}

export class Format6 extends CMAPSubTable {

	public language: number;
	public firstCode: number;
	public glyphIndexArray: number[];

	constructor(parameters: Format6Parameters = {}) {
		super(parameters);

		this.language = parameters.language || 0;
		this.firstCode = parameters.firstCode || 0;
		this.glyphIndexArray = parameters.glyphIndexArray || [];
	}

	static get className() {
		return "Format6";
	}

	toStream(stream: SeqStream) {
		stream.appendUint16(6); // CMAP format
		stream.appendUint16(10 + (2 * this.glyphIndexArray.length));
		stream.appendUint16(this.language);
		stream.appendUint16(this.firstCode);
		stream.appendUint16(this.glyphIndexArray.length);

		for (const glyphIndex of this.glyphIndexArray) {
			stream.appendUint16(glyphIndex);
		}

		return true;
	}

	public static fromStream(stream: SeqStream) {
		stream.getUint16(); // length

		const language = stream.getUint16();
		const firstCode = stream.getUint16();
		const entryCount = stream.getUint16();

		const glyphIndexArray: number[] = [];

		for (let j = 0; j < entryCount; j++) {
			const glyphIndex = stream.getUint16();
			glyphIndexArray.push(glyphIndex);
		}

		return new Format6({
			language,
			firstCode,
			glyphIndexArray
		});
	}

	/**
	 * Make Format6 table directly from array of glyphs
	 * @param language
	 * @param glyphs Array of glyphs
	 * @param firstCode
	 * @param platformID
	 * @param platformSpecificID
	 */
	public static fromGlyphs(language: number, glyphs: Glyph[], firstCode = 32, platformID = 3, platformSpecificID = 1): Format6 {
		const glyphIndexArray: number[] = [];

		for (let i = 0; i < glyphs.length; i++)
			glyphIndexArray.push(i);

		return new Format6({
			language,
			firstCode,
			glyphIndexArray,
			platformID,
			platformSpecificID
		});
	}

	public gid(code: number): number {
		let result = 0;

		for (let i = 0; i < this.glyphIndexArray.length; i++) {
			if ((this.firstCode + i) === code) {
				result = this.glyphIndexArray[i];
				break;
			}
		}

		return result;
	}

	public code(gid: number): number[] {
		switch (true) {
			case ((gid > (this.glyphIndexArray.length - 1)) && (gid < 0)):
				return [];
			case ((gid === 0) || (gid === 1)):
				return [65535];
			default:
		}

		return [this.firstCode + gid - 2]; // First GID belongs to "missing glyph", second is "null glyph"
	}

}
