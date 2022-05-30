import { SeqStream } from "bytestreamjs";
import { getLongDateTime, appendLongDateTime } from "../common";
import { FontTable } from "../Table";

export enum HEADFontDirectionHint {
	/**
	 * Fully mixed directional glyphs
	 */
	fullyMixed = 0,
	/**
	 * Only strongly left to right
	 */
	leftToRight = 1,
	/**
	 * Like 1 but also contains neutrals
	 */
	leftToRightNeutrals = 2,
	/**
	 * Only strongly right to left
	 */
	rightToLeft = -1,
	/**
	 * Like -1 but also contains neutrals
	 */
	rightToLeftNeutrals = -2,
}

export enum HEADMacStyleFlags {
	bold = 0x0001,
	italic = 0x0002,
	underline = 0x0004,
	outline = 0x0008,
	shadow = 0x0010,
	condensed = 0x0020,
	extended = 0x0040,
	//#region Reserved
	// Bits 7–15: Reserved (set to 0).
	//#endregion
}

export enum HEADFlags {
	/**
	 * Baseline for font at y=0.
	 */
	bit0 = 0x0001,
	/**
	 * Left sidebearing point at x=0 (relevant only for TrueType rasterizers) — see the note below regarding variable fonts.
	 */
	bit1 = 0x0002,
	/**
	 * Instructions may depend on point size.
	 */
	bit2 = 0x0004,
	/**
	 * Force ppem to integer values for all internal scaler math; may use fractional ppem sizes if this bit is clear. It is strongly recommended that this be set in hinted fonts.
	 */
	bit3 = 0x0008,
	/**
	 * Instructions may alter advance width (the advance widths might not scale linearly).
	 */
	bit4 = 0x0010,
	/**
	 * This bit is not used in OpenType, and should not be set in order to ensure compatible behavior on all platforms. If set, it may result in different behavior for vertical layout in some platforms. (See Apple’s specification for details regarding behavior in Apple platforms.)
	 */
	bit5 = 0x0020,
	/**
	 * These bits are not used in Opentype and should always be cleared. (See Apple’s specification for details regarding legacy used in Apple platforms.)
	 */
	// 6–10, Reserved
	/**
	 * Font data is “lossless” as a result of having been subjected to optimizing transformation and/or compression (such as e.g. compression mechanisms defined by ISO/IEC 14496-18, MicroType Express, WOFF 2.0 or similar) where the original font functionality and features are retained but the binary compatibility between input and output font files is not guaranteed. As a result of the applied transform, the DSIG table may also be invalidated.
	 */
	bit11 = 0x0800,
	/**
	 * Font converted (produce compatible metrics).
	 */
	bit12 = 0x1000,
	/**
	 * Font optimized for ClearType™. Note, fonts that rely on embedded bitmaps (EBDT) for rendering should not be considered optimized for ClearType, and therefore should keep this bit cleared.
	 */
	bit13 = 0x2000,
	/**
	 * Last Resort font. If set, indicates that the glyphs encoded in the 'cmap' subtables are simply generic symbolic representations of code point ranges and don’t truly represent support for those code points. If unset, indicates that the glyphs encoded in the 'cmap' subtables represent proper support for those code points.
	 */
	bit14 = 0x4000,
	/**
	 * Reserved, set to 0.
	 */
	// bit15 = 15,
}

export interface HEADParameters {
	/**
	 * Version number of the font header table
	 */
	version?: number;
	/**
	 * Set by font manufacturer
	 */
	fontRevision?: number;
	/**
	 * Computed check sum adjustment
	 */
	checkSumAdjustment?: number;
	/**
	 * Set to 0x5F0F3CF5
	 */
	magicNumber?: number;
	/**
	 * Flags
	 */
	flags?: HEADFlags;
	/**
	 * Set to a value from 16 to 16384
	 */
	unitsPerEm?: number;
	/**
	 * Created time
	 */
	created?: Date;
	/**
	 * Modified time
	 */
	modified?: Date;
	/**
	 * For all glyph bounding boxes
	 */
	xMin?: number;
	/**
	 * For all glyph bounding boxes
	 */
	yMin?: number;
	/**
	 * For all glyph bounding boxes
	 */
	xMax?: number;
	/**
	 * For all glyph bounding boxes
	 */
	yMax?: number;
	/**
	 * mac style
	 */
	macStyle?: HEADMacStyleFlags;
	/**
	 * Smallest readable size in pixels
	 */
	lowestRecPPEM?: number;
	/**
	 * Font description hint
	 */
	fontDirectionHint?: HEADFontDirectionHint;
	/**
	 * 0 for short offsets (Offset16), 1 for long (Offset32)
	 */
	indexToLocFormat?: number;
	/**
	 * 0 for current format
	 */
	glyphDataFormat?: number;
}

export class HEAD extends FontTable {

	/**
	 * Version number of the font header table
	 */
	public version: number;
	/**
	 * Set by font manufacturer
	 */
	public fontRevision: number;
	/**
	 * Computed check sum adjustment
	 */
	public checkSumAdjustment: number;
	/**
	 * Set to 0x5F0F3CF5
	 */
	public magicNumber: number;
	/**
	 * Flags
	 */
	public flags: HEADFlags;
	/**
	 * Set to a value from 16 to 16384
	 */
	public unitsPerEm: number;
	/**
	 * Created time
	 */
	public created:
	/**
	 * Modified time
	 */ Date;
	public modified:
	/**
	 * For all glyph bounding boxes
	 */ Date;
	public xMin: number;
	/**
	 * For all glyph bounding boxes
	 */
	public yMin: number;
	/**
	 * For all glyph bounding boxes
	 */
	public xMax: number;
	/**
	 * For all glyph bounding boxes
	 */
	public yMax: number;
	/**
	 * mac style
	 */
	public macStyle: HEADMacStyleFlags;
	/**
	 * Smallest readable size in pixels
	 */
	public lowestRecPPEM: number;
	/**
	 * Font description hint
	 */
	public fontDirectionHint: HEADFontDirectionHint;
	/**
	 * 0 for short offsets (Offset16), 1 for long (Offset32)
	 */
	public indexToLocFormat: number;
	/**
	 * 0 for current format
	 */
	public glyphDataFormat: number;

	constructor(parameters: HEADParameters = {}) {
		super();

		this.version = parameters.version || 0x00010000;
		this.fontRevision = parameters.fontRevision || 0x00010000;
		this.checkSumAdjustment = parameters.checkSumAdjustment || 0;
		this.magicNumber = parameters.magicNumber || 0x5F0F3CF5;
		this.flags = parameters.flags || 0;
		this.unitsPerEm = parameters.unitsPerEm || 2048;
		this.created = parameters.created || new Date();
		this.modified = parameters.modified || new Date();
		this.xMin = parameters.xMin || 0;
		this.yMin = parameters.yMin || 0;
		this.xMax = parameters.xMax || 0;
		this.yMax = parameters.yMax || 0;
		this.macStyle = parameters.macStyle || 0;
		this.lowestRecPPEM = parameters.lowestRecPPEM || 9;
		this.fontDirectionHint = parameters.fontDirectionHint || 2;
		this.indexToLocFormat = parameters.indexToLocFormat || 0;
		this.glyphDataFormat = parameters.glyphDataFormat || 0;
	}

	public static get tag() {
		return 0x68656164;
	}

	public toStream(stream: SeqStream): boolean {
		stream.appendUint32(this.version);
		stream.appendUint32(this.fontRevision);

		//#region The "checkSumAdjustment" need to be calculated later in "Font.toStream"
		stream.appendUint32(0);
		//#endregion

		stream.appendUint32(this.magicNumber);
		stream.appendUint16(this.flags);
		stream.appendUint16(this.unitsPerEm);
		appendLongDateTime(this.created, stream);
		appendLongDateTime(this.modified, stream);
		stream.appendInt16(this.xMin);
		stream.appendInt16(this.yMin);
		stream.appendInt16(this.xMax);
		stream.appendInt16(this.yMax);
		stream.appendUint16(this.macStyle);
		stream.appendUint16(this.lowestRecPPEM);
		stream.appendUint16(this.fontDirectionHint);
		stream.appendUint16(this.indexToLocFormat);
		stream.appendUint16(this.glyphDataFormat);

		return true;
	}

	public static fromStream(stream: SeqStream): HEAD {
		const parameters: HEADParameters = {};

		parameters.version = stream.getUint32();
		parameters.fontRevision = stream.getUint32();
		parameters.checkSumAdjustment = stream.getUint32();
		parameters.magicNumber = stream.getUint32();
		parameters.flags = stream.getUint16();
		parameters.unitsPerEm = stream.getUint16();
		parameters.created = getLongDateTime(stream);
		parameters.modified = getLongDateTime(stream);
		parameters.xMin = stream.getInt16();
		parameters.yMin = stream.getInt16();
		parameters.xMax = stream.getInt16();
		parameters.yMax = stream.getInt16();
		parameters.macStyle = stream.getUint16();
		parameters.lowestRecPPEM = stream.getUint16();
		parameters.fontDirectionHint = stream.getInt16();
		parameters.indexToLocFormat = stream.getInt16();
		parameters.glyphDataFormat = stream.getInt16();

		return new HEAD(parameters);
	}

}
