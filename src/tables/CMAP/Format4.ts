import { SeqStream } from "bytestreamjs";
import { Glyph } from "../GLYF/Glyph";
import { CMAPLanguage, CMAPSubTable, CMAPSubTableParameters, GlyphMap } from "./CMAPSubTable";

interface Information {
	start: number | null;
	end: number | null;
	delta: number;
	format: number;
	offset?: number;
}

// TODO Move Segment to class. Add methods to read/write codes and indexes
export interface Segment {
	codeToGID: Map<number, number>;
	gidToCode: Map<number, number>;
	delta?: number;
	offset?: number;
}

export interface Format4Parameters extends CMAPSubTableParameters {
	/**
	 * Format number is set to 4
	 */
	format?: 4;
	language?: number;
	segments?: Segment[];
}

/**
 * Representation of Format 4. Segment mapping to delta values
 * @see https://docs.microsoft.com/en-us/typography/opentype/spec/cmap#format-4-segment-mapping-to-delta-values
 */
export class Format4 extends CMAPSubTable implements CMAPLanguage {
	
	/**
	 * Format number is set to 4
	 */
	public get format(): 4 {
		return 4;
	}
	public language: number;
	public segments: Segment[];
	
	constructor(parameters: Format4Parameters = {}) {
		super(parameters);
		
		this.language = parameters.language || 0;
		this.segments = parameters.segments || [];
	}

	protected onGetGlyphMap(): GlyphMap {
		const map: GlyphMap = new Map<number, number>();
		for (const segment of this.segments) {
			segment.codeToGID.forEach((value, key) => {
				map.set(key, value);
			});
		}

		return map;
	}
	
	static get className() {
		return "Format4";
	}

	public toStream(stream: SeqStream): boolean {
		//#region Initial variables
		const segCountX2 = this.segments.length << 1;
		const searchRange = Math.pow(2, Math.floor(Math.log(this.segments.length) / Math.log(2))) * 2;

		const startCode: number[] = [];
		const endCode: number[] = [];
		const idDelta: number[] = [];
		const idRangeOffset: number[] = [];
		//#endregion
		//#region Analyze segments
		const segmentInformation = [];

		for (const segment of this.segments) {
			//#region Initial variables
			let start = null;
			let end = null;

			let pKey = null;
			let pValue = null;

			let format = 0;
			//#endregion
			//#region Check all values in the segment
			segment.codeToGID = new Map([...segment.codeToGID.entries()].sort((a, b) => (a[0] - b[0])));

			for (const [key, value] of segment.codeToGID) {
				if (start === null) {
					start = key;
				}

				end = key;

				if (pKey === null)
					pKey = key;
				else {
					if ((pKey + 1) !== key)
						throw new Error("Inconsistent information in CMAP segment");

					pKey = key;
				}

				if (pValue === null)
					pValue = value;
				else {
					if ((pValue + 1) !== value)
						format = 1;

					pValue = value;
				}
			}
			//#endregion
			//#region Set correct "delta" values (useless in case "format = 1")
			const information: Information = {
				start,
				end,
				delta: 0,
				format
			};

			if (format === 0) {
				// TODO Remove lint and ts comments
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				information.delta = (segment.codeToGID.get(information.start) - information.start); // & 0xFFFF;
			}
			//#endregion
			segmentInformation.push(information);
		}
		//#endregion
		//#region Write "format = 1" segments to temporary stream
		const format1Stream = new SeqStream();

		for (let i = 0; i < this.segments.length; i++) {
			if (segmentInformation[i].format === 1) {
				segmentInformation[i].offset = format1Stream.start + segCountX2 - (i << 1);

				for (const value of this.segments[i].codeToGID.values()) {
					format1Stream.appendUint16(value);
				}
			}
		}
		//#endregion
		//#region Write information header
		stream.appendUint16(4); // CMAP format
		stream.appendUint16(14 + (4 * this.segments.length * 2) + format1Stream.length + 2); // +2 for "reservedPad"
		stream.appendUint16(this.language);
		stream.appendUint16(segCountX2);
		stream.appendUint16(searchRange);
		stream.appendUint16(Math.log(searchRange >> 1) / Math.log(2));
		stream.appendUint16(segCountX2 - searchRange);
		//#endregion
		//#region Write aux arrays
		for (const information of segmentInformation) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			startCode.push(information.start!);
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			endCode.push(information.end!);
			idDelta.push(information.delta);
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			idRangeOffset.push(information.offset!);
		}

		for (const code of endCode) {
			stream.appendUint16(code);
		}

		stream.appendUint16(0); // reservedPad

		for (const code of startCode) {
			stream.appendUint16(code);
		}

		for (const code of idDelta) {
			stream.appendUint16(code);
		}

		for (const code of idRangeOffset) {
			stream.appendUint16(code);
		}
		//#endregion
		//#region Finally append information about "format = 1" segments
		stream.appendView(new Uint8Array(format1Stream.buffer));
		//#endregion

		return true;
	}

	public static fromStream(stream: SeqStream): Format4 {
		//#region Read major information
		stream.getUint16(); // length

		const language = stream.getUint16(); // language
		const segCountX2 = stream.getUint16(); // segCountX2
		const segCount = segCountX2 >> 1;
		stream.getUint16(); // searchRange
		stream.getUint16(); // entrySelector
		stream.getUint16(); // rangeShift
		//#endregion

		//#region Initialize "endCode" array
		const endCode: number[] = [];

		for (let i = 0; i < segCount; i++) {
			const code = stream.getUint16();
			endCode.push(code);
		}
		//#endregion

		stream.getUint16(); // reservedPad

		//#region Initialize "startCode" array
		const startCode: number[] = [];

		for (let i = 0; i < segCount; i++) {
			const code = stream.getUint16();
			startCode.push(code);
		}
		//#endregion

		//#region Initialize "idDelta" array
		const idDelta = [];

		for (let i = 0; i < segCount; i++) {
			const code = stream.getInt16();
			idDelta.push(code);
		}
		//#endregion

		//#region Initialize "idRangeOffset" array
		const idRangeTableOffset = stream.start;

		const idRangeOffset: number[] = [];

		for (let i = 0; i < segCount; i++) {
			const code = stream.getUint16();
			idRangeOffset.push(code);
		}
		//#endregion

		//#region Combine all segment's data and calculate glyph's indexes
		const segments: Segment[] = [];

		for (let i = 0; i < segCount; i++) {
			//#region Initial variables
			const codeToGID = new Map<number, number>();
			const gidToCode = new Map<number, number>();

			const start = startCode[i];
			const end = endCode[i];
			const offset = idRangeTableOffset + (i * 2);

			let rangeStream: SeqStream | null = null;
			const id = idRangeOffset[i];
			if (id) {
				rangeStream = new SeqStream({
					stream: stream.stream.slice(
						offset + id,
						offset + id + ((end - start) << 1) + 2)
				});
			}
			//#endregion
			for (let j = start; j <= end; j++) {
				let glyphIndex = 0;

				if (rangeStream) {
					const value = rangeStream.getUint16();
					glyphIndex = (value + idDelta[i]) & 0xFFFF;
				} else {
					glyphIndex = (j + idDelta[i]) & 0xFFFF;
				}

				codeToGID.set(j, glyphIndex);
				gidToCode.set(glyphIndex, j);
			}

			segments.push({
				codeToGID,
				gidToCode,
				delta: idDelta[i],
				offset: idRangeOffset[i],
			});
		}
		//#endregion

		return new Format4({
			language,
			segments
		});
	}

	/**
	 * Make Format4 table directly from array of code points
	 *
	 * @param language
	 * @param glyphs Array of glyphs.
	 *
	 * !!! MUST BE WITH "MISSING" AND "NULL" GLYPHS !!!
	 * @param [platformID=3]
	 * @param [platformSpecificID=1]
	 */
	public static fromGlyphs(language: number, glyphs: Glyph[], platformID = 3, platformSpecificID = 1): Format4 {
		//#region Initial variables
		const codeToGID = new Map<number, number>();

		const segments: Segment[] = [];
		//#endregion
		//#region Fill map (!!! FIRST TWO GLYPHS MUST BE "MISSING" AND "NULL" GLYPHS !!!)
		for (let i = 2; i < glyphs.length; i++) {
			for (const unicode of glyphs[i].unicodes!)
				codeToGID.set(unicode, i);
		}
		//#endregion
		//#region Divide map to correct regions
		const codeToGIDArray = Array.from(codeToGID).sort((a, b) => (a[0] - b[0]));

		let segment = {
			codeToGID: new Map(),
			gidToCode: new Map()
		};

		let prevCode = codeToGIDArray[0][0] - 1;

		for (let i = 0; i < codeToGIDArray.length; i++) {
			if (codeToGIDArray[i][0] > (prevCode + 1)) {
				segments.push(segment);

				segment = {
					codeToGID: new Map([codeToGIDArray[i]]),
					gidToCode: new Map([[codeToGIDArray[i][1], codeToGIDArray[i][0]]])
				};
			} else {
				segment.codeToGID.set(codeToGIDArray[i][0], codeToGIDArray[i][1]);
				segment.gidToCode.set(codeToGIDArray[i][1], codeToGIDArray[i][0]);
			}

			prevCode = codeToGIDArray[i][0];
		}

		segments.push(segment);
		//#endregion
		//#region Append specific segment for "missingGlyph"
		segments.push({
			codeToGID: new Map([[0xFFFF, 0]]),
			gidToCode: new Map([[0, 0xFFFF]]),
		});
		//#endregion
		
		return new Format4({
			language,
			segments,
			platformID,
			platformSpecificID
		});
	}

	public gid(code: number): number {
		// Replace absent chars via GID = 0 (as it is required by standard)
		for (const segment of this.segments) {
			const result = segment.codeToGID.get(code);
			if (result) {
				return result;
			}
		}

		return 0;
	}

	public code(gid: number): number[] {
		const result: number[] = [];

		for (const segment of this.segments) {
			const segmentResult = segment.gidToCode.get(gid);
			if (typeof segmentResult !== "undefined")
				result.push(segmentResult);
		}

		return result;
	}

}
