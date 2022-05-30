import { SeqStream } from "bytestreamjs";
import { FontTable } from "../Table";

export interface HMTXMetrix {
	/**
	 * Advance width, in font design units
	 */
	advanceWidth: number;
	/**
	 * Glyph left side bearing, in font design units
	 */
	leftSideBearing: number;
}

export interface HMTXParameters {
	/**
	 * Paired advance width and left side bearing values for each glyph. Records are indexed by glyph ID
	 */
	hMetrics?: HMTXMetrix[];
	/**
	 * Left side bearings for glyph IDs greater than or equal to numberOfHMetrics
	 */
	leftSideBearings?: number[];
}

/**
 * Represents HMTX table. Horizontal Metrics Table
 * @see https://docs.microsoft.com/en-us/typography/opentype/spec/hmtx
 */
export class HMTX extends FontTable {

	/**
	 * Paired advance width and left side bearing values for each glyph. Records are indexed by glyph ID
	 */
	public hMetrics: HMTXMetrix[];
	/**
	 * Left side bearings for glyph IDs greater than or equal to numberOfHMetrics
	 */
	public leftSideBearings: number[];

	constructor(parameters: HMTXParameters = {}) {
		super();

		this.hMetrics = parameters.hMetrics || [];
		this.leftSideBearings = parameters.leftSideBearings || [];
	}

	public static get tag() {
		return 0x686D7478;
	}

	public toStream(stream: SeqStream) {
		for (const hMetric of this.hMetrics) {
			stream.appendUint16(hMetric.advanceWidth);
			stream.appendInt16(hMetric.leftSideBearing);
		}

		for (const leftSideBearing of this.leftSideBearings) {
			stream.appendInt16(leftSideBearing);
		}

		return true;
	}

	/**
	 * Convert SeqStream data to object
	 * @param stream
	 * @param numGlyphs The value is found in the 'maxp' table
	 * @param numOfLongHorMetrics The value is found in the 'hhea' (Horizontal Header) table
	 */
	static fromStream(stream: SeqStream, numGlyphs: number, numOfLongHorMetrics: number) {
		const parameters: HMTXParameters = {};

		parameters.hMetrics = [];
		parameters.leftSideBearings = [];

		for (let i = 0; i < numOfLongHorMetrics; i++) {
			const hMetrics = {
				advanceWidth: stream.getUint16(),
				leftSideBearing: stream.getInt16(),
			};

			parameters.hMetrics.push(hMetrics);
		}

		for (let i = 0; i < (numGlyphs - numOfLongHorMetrics); i++) {
			const value = stream.getInt16();

			parameters.leftSideBearings.push(value);
		}

		return new HMTX(parameters);
	}

}
