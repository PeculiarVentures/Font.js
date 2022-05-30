import { SeqStream } from "bytestreamjs";
import { FontTable } from "../Table";

export interface HHEAParameters {
	/**
	 * version number of the horizontal header table
	 */
	version?: number;
	/**
	 * Typographic ascent
	 */
	ascent?: number;
	/**
	 * Typographic descent
	 */
	descent?: number;
	/**
	 * Typographic line gap
	 */
	lineGap?: number;
	/**
	 * Maximum advance width value in 'hmtx' table
	 */
	advanceWidthMax?: number;
	/**
	 * Minimum left sidebearing value in 'hmtx' table for glyphs with contours (empty glyphs should be ignored)
	 */
	minLeftSideBearing?: number;
	/**
	 * Minimum right sidebearing value; calculated as min(aw - (lsb + xMax - xMin)) for glyphs with contours (empty glyphs should be ignored)
	 */
	minRightSideBearing?: number;
	/**
	 * Max(lsb + (xMax - xMin))
	 */
	xMaxExtent?: number;
	/**
	 * Used to calculate the slope of the cursor (rise/run); 1 for vertical
	 */
	caretSlopeRise?: number;
	/**
	 * 0 for vertical
	 */
	caretSlopeRun?: number;
	/**
	 * The amount by which a slanted highlight on a glyph needs to be shifted to produce the best appearance. Set to 0 for non-slanted fonts
	 */
	caretOffset?: number;
	/**
	 * set to 0
	 */
	reserved1?: number;
	/**
	 * set to 0
	 */
	reserved2?: number;
	/**
	 * set to 0
	 */
	reserved3?: number;
	/**
	 * set to 0
	 */
	reserved4?: number;
	/**
	 * 0 for current format
	 */
	metricDataFormat?: number;
	/**
	 * Number of hMetric entries in 'hmtx' table
	 */
	numOfLongHorMetrics?: number;
}
/**
 * Representation of HEAD table. Horizontal Header Table. This table contains information for horizontal layout
 * @see https://docs.microsoft.com/en-us/typography/opentype/spec/hhea
 */
export class HHEA extends FontTable {

	/**
	 * version number of the horizontal header table
	 */
	public version: number;
	/**
	 * Typographic ascent
	 */
	public ascent: number;
	/**
	 * Typographic descent
	 */
	public descent: number
	/**
	 * Typographic line gap */;
	public lineGap: number;
	/**
	 * Maximum advance width value in 'hmtx' table
	 */
	public advanceWidthMax: number;
	/**
	 * Minimum left sidebearing value in 'hmtx' table for glyphs with contours (empty glyphs should be ignored)
	 */
	public minLeftSideBearing: number;
	/**
	 * Minimum right sidebearing value; calculated as min(aw - (lsb + xMax - xMin)) for glyphs with contours (empty glyphs should be ignored)
	 */
	public minRightSideBearing: number;
	/**
	 * Max(lsb + (xMax - xMin))
	 */
	public xMaxExtent: number;
	/**
	 * Used to calculate the slope of the cursor (rise/run); 1 for vertical
	 */
	public caretSlopeRise: number;
	/**
	 * 0 for vertical
	 */
	public caretSlopeRun: number;
	/**
	 * The amount by which a slanted highlight on a glyph needs to be shifted to produce the best appearance. Set to 0 for non-slanted fonts
	 */
	public caretOffset: number;
	/**
	 * set to 0
	 */
	public reserved1: number;
	/**
	 * set to 0
	 */
	public reserved2: number;
	/**
	 * set to 0
	 */
	public reserved3: number;
	/**
	 * set to 0
	 */
	public reserved4: number;

	/**
	 * 0 for current format
	 */
	public metricDataFormat: number;
	/**
	 * Number of hMetric entries in 'hmtx' table
	 */
	public numOfLongHorMetrics: number;


	constructor(parameters: HHEAParameters = {}) {
		super();

		this.version = parameters.version || 0x00010000;
		this.ascent = parameters.ascent || 0;
		this.descent = parameters.descent || 0;
		this.lineGap = parameters.lineGap || 0;
		this.advanceWidthMax = parameters.advanceWidthMax || 0;
		this.minLeftSideBearing = parameters.minLeftSideBearing || 0;
		this.minRightSideBearing = parameters.minRightSideBearing || 0;
		this.xMaxExtent = parameters.xMaxExtent || 0;
		this.caretSlopeRise = parameters.caretSlopeRise || 0;
		this.caretSlopeRun = parameters.caretSlopeRun || 0;
		this.caretOffset = parameters.caretOffset || 0;
		this.reserved1 = parameters.reserved1 || 0;
		this.reserved2 = parameters.reserved2 || 0;
		this.reserved3 = parameters.reserved3 || 0;
		this.reserved4 = parameters.reserved4 || 0;
		this.metricDataFormat = parameters.metricDataFormat || 0;
		this.numOfLongHorMetrics = parameters.numOfLongHorMetrics || 0;
	}

	public static get tag() {
		return 0x68686561;
	}

	public toStream(stream: SeqStream): boolean {
		stream.appendUint32(this.version);
		stream.appendInt16(this.ascent);
		stream.appendInt16(this.descent);
		stream.appendInt16(this.lineGap);
		stream.appendUint16(this.advanceWidthMax);
		stream.appendInt16(this.minLeftSideBearing);
		stream.appendInt16(this.minRightSideBearing);
		stream.appendInt16(this.xMaxExtent);
		stream.appendInt16(this.caretSlopeRise);
		stream.appendInt16(this.caretSlopeRun);
		stream.appendInt16(this.caretOffset);
		stream.appendInt16(this.reserved1);
		stream.appendInt16(this.reserved2);
		stream.appendInt16(this.reserved3);
		stream.appendInt16(this.reserved4);
		stream.appendInt16(this.metricDataFormat);
		stream.appendUint16(this.numOfLongHorMetrics);

		return true;
	}

	public static fromStream(stream: SeqStream) {
		const parameters: HHEAParameters = {};

		parameters.version = stream.getUint32();
		parameters.ascent = stream.getInt16();
		parameters.descent = stream.getInt16();
		parameters.lineGap = stream.getInt16();
		parameters.advanceWidthMax = stream.getUint16();
		parameters.minLeftSideBearing = stream.getInt16();
		parameters.minRightSideBearing = stream.getInt16();
		parameters.xMaxExtent = stream.getInt16();
		parameters.caretSlopeRise = stream.getInt16();
		parameters.caretSlopeRun = stream.getInt16();
		parameters.caretOffset = stream.getInt16();
		parameters.reserved1 = stream.getInt16();
		parameters.reserved2 = stream.getInt16();
		parameters.reserved3 = stream.getInt16();
		parameters.reserved4 = stream.getInt16();
		parameters.metricDataFormat = stream.getInt16();
		parameters.numOfLongHorMetrics = stream.getUint16();

		return new HHEA(parameters);
	}

}
