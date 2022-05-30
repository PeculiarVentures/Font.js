import { SeqStream } from "bytestreamjs";
import { FontTable } from "../Table";

export enum OS2Weight {
	/**
	 * Thin
	 */
	thin = 100,
	/**
	 * Extra-light (Ultra-light)
	 */
	extraLight = 200,
	/**
	 * Light
	 */
	light = 300,
	/**
	 * Normal (Regular)
	 */
	normal = 400,
	/**
	 * Medium
	 */
	medium = 500,
	/**
	 * Semi-bold (Demi-bold)
	 */
	semiBold = 600,
	/**
	 * Bold
	 */
	bold = 700,
	/**
	 * Extra-bold (Ultra-bold)
	 */
	extrabold = 800,
	/**
	 * Black (Heavy)
	 */
	black = 900,
}

export enum OS2Width {
	/**
	 * Ultra-condensed. 50% of normal
	 */
	ultraCondensed = 1,
	/**
	 * Extra-condensed. 62.5% of normal
	 */
	extraCondensed = 2,
	/**
	 * Condensed. 75% of normal
	 */
	condensed = 3,
	/**
	 * Semi-condensed. 87.5% of normal
	 */
	semiCondensed = 4,
	/**
	 * Medium (normal). 100% of normal
	 */
	normal = 5,
	/**
	 * Semi-expanded. 112.5% of normal
	 */
	semiExpanded = 6,
	/**
	 * Expanded. 125% of normal
	 */
	expanded = 7,
	/**
	 * Extra-expanded. 150% of normal
	 */
	extraExpanded = 8,
	/**
	 * Ultra-expanded. 200% of normal
	 */
	ultraExpanded = 9,
}

export enum OS2TypeFlags {
	/**
	 * @deprecated
	 */
	installableEmbedding = 0x0001,
	restrictedLicenseEmbedding = 0x0002,
	previewPrintEmbedding = 0x0004,
	editableEmbedding = 0x0008,
	//#region Reserved
	// 0x0010
	// 0x0020
	// 0x0040
	// 0x0080
	//#endregion
	noSubsetting = 0x0100,
	bitmapEmbeddingOnly = 0x0200,
	//#region Reserved
	// 0x0400
	// 0x0800
	// 0x1000
	// 0x2000
	// 0x4000
	// 0x8000
	//#endregion
}
/**
 * Font-family class
 * @see https://docs.microsoft.com/en-us/typography/opentype/spec/ibmfc
 */
export enum OS2Family {
	none = 0,
	oldstyleSerifs = 1,
	transitionalSerifs = 2,
	modernSerifs = 3,
	clarendonSerifs = 4,
	slabSerifs = 5,
	// 6, Reserved
	freeformSerifs = 7,
	sansSerif = 8,
	ornamentals = 9,
	scripts = 10,
	// 11, Reserved
	symbolic = 12,
	// 13, Reserved
	// 14, Reserved
}

/**
 * Font selection flags
 * @see https://docs.microsoft.com/en-us/typography/opentype/spec/os2#fsselection
 */
export enum OS2SelectionFlags {
	italic = 0x0001,
	underscore = 	0x0002,
	negative = 0x0004,
	outlined = 0x0008,
	strikeout = 0x0010,
	bold = 0x0020,
	regular = 0x0040,
	useTypoMetrics = 0x0080,
	wws = 0x0100,
	oblique = 0x0200,
	//#region Reserved
	// 0x0400,
	// 0x0800,
	// 0x1000,
	// 0x2000,
	// 0x4000,
	// 0x8000,
	//#endregion
}

export interface OS2Parameters {
	/**
	 * The version number for the OS/2 table: 0x0000 to 0x0005
	 */
	version?: number;
	/**
	 * The Average Character Width parameter specifies the arithmetic average of the escapement (width) of all non-zero width glyphs in the font
	 */
	xAvgCharWidth?: number;
	/**
	 * Indicates the visual weight (degree of blackness or thickness of strokes) of the characters in the font. Values from 1 to 1000 are valid
	 */
	usWeightClass?: OS2Weight;
	/**
	 * Indicates a relative change from the normal aspect ratio (width to height ratio) as specified by a font designer for the glyphs in a font
	 */
	usWidthClass?: OS2Width;
	/**
	 * Indicates font embedding licensing rights for the font
	 */
	fsType?: OS2TypeFlags;
	/**
	 * The recommended horizontal size in font design units for subscripts for this font
	 */
	ySubscriptXSize?: number;
	/**
	 * The recommended vertical size in font design units for subscripts for this font
	 */
	ySubscriptYSize?: number;
	/**
	 * The recommended horizontal offset in font design units for subscripts for this font
	 */
	ySubscriptXOffset?: number;
	/**
	 * The recommended vertical offset in font design units from the baseline for subscripts for this font
	 */
	ySubscriptYOffset?: number;
	/**
	 * The recommended horizontal size in font design units for superscripts for this font
	 */
	ySuperscriptXSize?: number;
	/**
	 * The recommended vertical size in font design units for superscripts for this font
	 */
	ySuperscriptYSize?: number;
	/**
	 * The recommended horizontal offset in font design units for superscripts for this font
	 */
	ySuperscriptXOffset?: number;
	/**
	 * The recommended vertical offset in font design units from the baseline for superscripts for this font
	 */
	ySuperscriptYOffset?: number;
	/**
	 * Thickness of the strikeout stroke in font design units
	 */
	yStrikeoutSize?: number;
	/**
	 * The position of the top of the strikeout stroke relative to the baseline in font design units
	 */
	yStrikeoutPosition?: number;
	/**
	 * This parameter is a classification of font-family design
	 */
	sFamilyClass?: OS2Family;
	/**
	 * This 10-byte series of numbers is used to describe the visual characteristics of a given typeface
	 */
	panose?: Uint8Array;
	/**
	 * Unicode Character Range
	 */
	ulUnicodeRange1?: number;
	/**
	 * Unicode Character Range
	 */
	ulUnicodeRange2?: number;
	/**
	 * Unicode Character Range
	 */
	ulUnicodeRange3?: number;
	/**
	 * Unicode Character Range
	 */
	ulUnicodeRange4?: number;
	/**
	 * The four-character identifier for the vendor of the given type face
	 */
	achVendID?: number;
	/**
	 * Contains information concerning the nature of the font patterns
	 */
	fsSelection?: OS2SelectionFlags;
	/**
	 * The minimum Unicode index (character code) in this font, according to the 'cmap' subtable for platform ID 3 and platform- specific encoding ID 0 or 1
	 */
	usFirstCharIndex?: number;
	/**
	 * The maximum Unicode index (character code) in this font, according to the 'cmap' subtable for platform ID 3 and encoding ID 0 or 1
	 */
	usLastCharIndex?: number;
	/**
	 * The typographic ascender for this font
	 */
	sTypoAscender?: number;
	/**
	 * The typographic descender for this font
	 */
	sTypoDescender?: number;
	/**
	 * The typographic line gap for this font
	 */
	sTypoLineGap?: number;
	/**
	 * The “Windows ascender” metric
	 */
	usWinAscent?: number;
	/**
	 * The “Windows descender” metric
	 */
	usWinDescent?: number;
	/**
	 * Code Page Character Range
	 */
	ulCodePageRange1?: number;
	/**
	 * Code Page Character Range
	 */
	ulCodePageRange2?: number;
	/**
	 * This metric specifies the distance between the baseline and the approximate height of non-ascending lowercase letters measured in FUnits
	 */
	sxHeight?: number;
	/**
	 * This metric specifies the distance between the baseline and the approximate height of uppercase letters measured in FUnits
	 */
	sCapHeight?: number;
	/**
	 * This is the Unicode code point, in UTF-16 encoding, of a character that can be used for a default glyph if a requested character is not supported in the font
	 */
	usDefaultChar?: number;
	/**
	 * This is the Unicode code point, in UTF-16 encoding, of a character that can be used as a default break character
	 */
	usBreakChar?: number;
	/**
	 * The maximum length of a target glyph context for any feature in this font
	 */
	usMaxContext?: number;
	/**
	 * This field is used for fonts with multiple optical styles
	 */
	usLowerOpticalPointSize?: number;
	/**
	 * This field is used for fonts with multiple optical styles
	 */
	usUpperOpticalPointSize?: number;
}

export class OS2 extends FontTable { // TODO should be split into version classes
	/**
	 * The version number for the OS/2 table: 0x0000 to 0x0005
	 */
	version: number;
	/**
	 * The Average Character Width parameter specifies the arithmetic average of the escapement (width) of all non-zero width glyphs in the font
	 */
	xAvgCharWidth: number;
	/**
	 * Indicates the visual weight (degree of blackness or thickness of strokes) of the characters in the font. Values from 1 to 1000 are valid
	 */
	usWeightClass: OS2Weight;
	/**
	 * Indicates a relative change from the normal aspect ratio (width to height ratio) as specified by a font designer for the glyphs in a font
	 */
	usWidthClass: OS2Width;
	/**
	 * Indicates font embedding licensing rights for the font
	 */
	fsType: OS2TypeFlags;
	/**
	 * The recommended horizontal size in font design units for subscripts for this font
	 */
	ySubscriptXSize: number;
	/**
	 * The recommended vertical size in font design units for subscripts for this font
	 */
	ySubscriptYSize: number;
	/**
	 * The recommended horizontal offset in font design units for subscripts for this font
	 */
	ySubscriptXOffset: number;
	/**
	 * The recommended vertical offset in font design units from the baseline for subscripts for this font
	 */
	ySubscriptYOffset: number;
	/**
	 * The recommended horizontal size in font design units for superscripts for this font
	 */
	ySuperscriptXSize: number;
	/**
	 * The recommended vertical size in font design units for superscripts for this font
	 */
	ySuperscriptYSize: number;
	/**
	 * The recommended horizontal offset in font design units for superscripts for this font
	 */
	ySuperscriptXOffset: number;
	/**
	 * The recommended vertical offset in font design units from the baseline for superscripts for this font
	 */
	ySuperscriptYOffset: number;
	/**
	 * Thickness of the strikeout stroke in font design units
	 */
	yStrikeoutSize: number;
	/**
	 * The position of the top of the strikeout stroke relative to the baseline in font design units
	 */
	yStrikeoutPosition: number;
	/**
	 * This parameter is a classification of font-family design
	 */
	sFamilyClass: OS2Family;
	/**
	 * This 10-byte series of numbers is used to describe the visual characteristics of a given typeface
	 * @see https://docs.microsoft.com/en-us/typography/opentype/spec/os2#panose
	 */
	panose: Uint8Array; // TODO Use structure
	/**
	 * Unicode Character Range
	 */
	ulUnicodeRange1: number;
	/**
	 * Unicode Character Range
	 */
	ulUnicodeRange2: number;
	/**
	 * Unicode Character Range
	 */
	ulUnicodeRange3: number;
	/**
	 * Unicode Character Range
	 */
	ulUnicodeRange4: number;
	/**
	 * The four-character identifier for the vendor of the given type face
	 */
	achVendID: number;
	/**
	 * Contains information concerning the nature of the font patterns
	 */
	fsSelection: OS2SelectionFlags;
	/**
	 * The minimum Unicode index (character code) in this font, according to the 'cmap' subtable for platform ID 3 and platform- specific encoding ID 0 or 1
	 */
	usFirstCharIndex: number;
	/**
	 * The maximum Unicode index (character code) in this font, according to the 'cmap' subtable for platform ID 3 and encoding ID 0 or 1
	 */
	usLastCharIndex: number;
	/**
	 * The typographic ascender for this font
	 */
	sTypoAscender: number;
	/**
	 * The typographic descender for this font
	 */
	sTypoDescender: number;
	/**
	 * The typographic line gap for this font
	 */
	sTypoLineGap: number;
	/**
	 * The “Windows ascender” metric
	 */
	usWinAscent: number;
	/**
	 * The “Windows descender” metric
	 */
	usWinDescent: number;
	/**
	 * Code Page Character Range
	 */
	ulCodePageRange1?: number;
	/**
	 * Code Page Character Range
	 */
	ulCodePageRange2?: number;
	/**
	 * This metric specifies the distance between the baseline and the approximate height of non-ascending lowercase letters measured in FUnits
	 */
	sxHeight?: number;
	/**
	 * This metric specifies the distance between the baseline and the approximate height of uppercase letters measured in FUnits
	 */
	sCapHeight?: number;
	/**
	 * This is the Unicode code point, in UTF-16 encoding, of a character that can be used for a default glyph if a requested character is not supported in the font
	 */
	usDefaultChar?: number;
	/**
	 * This is the Unicode code point, in UTF-16 encoding, of a character that can be used as a default break character
	 */
	usBreakChar?: number;
	/**
	 * The maximum length of a target glyph context for any feature in this font
	 */
	usMaxContext?: number;
	/**
	 * This field is used for fonts with multiple optical styles
	 */
	usLowerOpticalPointSize?: number;
	/**
	 * This field is used for fonts with multiple optical styles
	 */
	usUpperOpticalPointSize?: number;

	constructor(parameters: OS2Parameters = {}) {
		super();

		this.version = parameters.version || 0;
		this.xAvgCharWidth = parameters.xAvgCharWidth || 0;
		this.usWeightClass = parameters.usWeightClass || 0;
		this.usWidthClass = parameters.usWidthClass || 0;
		this.fsType = parameters.fsType || 0;
		this.ySubscriptXSize = parameters.ySubscriptXSize || 0;
		this.ySubscriptYSize = parameters.ySubscriptYSize || 0;
		this.ySubscriptXOffset = parameters.ySubscriptXOffset || 0;
		this.ySubscriptYOffset = parameters.ySubscriptYOffset || 0;
		this.ySuperscriptXSize = parameters.ySuperscriptXSize || 0;
		this.ySuperscriptYSize = parameters.ySuperscriptYSize || 0;
		this.ySuperscriptXOffset = parameters.ySuperscriptXOffset || 0;
		this.ySuperscriptYOffset = parameters.ySuperscriptYOffset || 0;
		this.yStrikeoutSize = parameters.yStrikeoutSize || 0;
		this.yStrikeoutPosition = parameters.yStrikeoutPosition || 0;
		this.sFamilyClass = parameters.sFamilyClass || 0;
		this.panose = parameters.panose || new Uint8Array();
		this.ulUnicodeRange1 = parameters.ulUnicodeRange1 || 0;
		this.ulUnicodeRange2 = parameters.ulUnicodeRange2 || 0;
		this.ulUnicodeRange3 = parameters.ulUnicodeRange3 || 0;
		this.ulUnicodeRange4 = parameters.ulUnicodeRange4 || 0;
		this.achVendID = parameters.achVendID || 0;
		this.fsSelection = parameters.fsSelection || 0;
		this.usFirstCharIndex = parameters.usFirstCharIndex || 0;
		this.usLastCharIndex = parameters.usLastCharIndex || 0;
		this.sTypoAscender = parameters.sTypoAscender || 0;
		this.sTypoDescender = parameters.sTypoDescender || 0;
		this.sTypoLineGap = parameters.sTypoLineGap || 0;
		this.usWinAscent = parameters.usWinAscent || 0;
		this.usWinDescent = parameters.usWinDescent || 0;

		if (this.version >= 1) {
			this.ulCodePageRange1 = parameters.ulCodePageRange1 || 0;
			this.ulCodePageRange2 = parameters.ulCodePageRange2 || 0;
		}

		if (this.version >= 2) {
			this.sxHeight = parameters.sxHeight || 0;
			this.sCapHeight = parameters.sCapHeight || 0;
			this.usDefaultChar = parameters.usDefaultChar || 0;
			this.usBreakChar = parameters.usBreakChar || 0;
			this.usMaxContext = parameters.usMaxContext || 0;
		}

		if (this.version >= 5) {
			this.usLowerOpticalPointSize = parameters.usLowerOpticalPointSize || 0;
			this.usUpperOpticalPointSize = parameters.usUpperOpticalPointSize || 0;
		}
	}

	public static get tag() {
		return 0x4F532F32;
	}

	public toStream(stream: SeqStream): boolean {
		stream.appendUint16(this.version);
		stream.appendInt16(this.xAvgCharWidth);
		stream.appendUint16(this.usWeightClass);
		stream.appendUint16(this.usWidthClass);
		stream.appendUint16(this.fsType);
		stream.appendInt16(this.ySubscriptXSize);
		stream.appendInt16(this.ySubscriptYSize);
		stream.appendInt16(this.ySubscriptXOffset);
		stream.appendInt16(this.ySubscriptYOffset);
		stream.appendInt16(this.ySuperscriptXSize);
		stream.appendInt16(this.ySuperscriptYSize);
		stream.appendInt16(this.ySuperscriptXOffset);
		stream.appendInt16(this.ySuperscriptYOffset);
		stream.appendInt16(this.yStrikeoutSize);
		stream.appendInt16(this.yStrikeoutPosition);
		stream.appendInt16(this.sFamilyClass);
		stream.appendView(this.panose);
		stream.appendUint32(this.ulUnicodeRange1);
		stream.appendUint32(this.ulUnicodeRange2);
		stream.appendUint32(this.ulUnicodeRange3);
		stream.appendUint32(this.ulUnicodeRange4);
		stream.appendUint32(this.achVendID);
		stream.appendUint16(this.fsSelection);
		stream.appendUint16(this.usFirstCharIndex);
		stream.appendUint16(this.usLastCharIndex);
		stream.appendInt16(this.sTypoAscender);
		stream.appendInt16(this.sTypoDescender);
		stream.appendInt16(this.sTypoLineGap);
		stream.appendUint16(this.usWinAscent);
		stream.appendUint16(this.usWinDescent);

		if (this.version >= 1) {
			stream.appendUint32(this.ulCodePageRange1!);
			stream.appendUint32(this.ulCodePageRange2!);
		}

		if (this.version >= 2) {
			stream.appendInt16(this.sxHeight!);
			stream.appendInt16(this.sCapHeight!);
			stream.appendUint16(this.usDefaultChar!);
			stream.appendUint16(this.usBreakChar!);
			stream.appendUint16(this.usMaxContext!);
		}

		if (this.version >= 5) {
			stream.appendUint16(this.usLowerOpticalPointSize!);
			stream.appendUint16(this.usUpperOpticalPointSize!);
		}

		return true;
	}

	public static fromStream(stream: SeqStream) {
		//#region Initial variables
		const parameters: OS2Parameters = {};
		//#endregion

		//#region Parse "version = 0" parameters
		parameters.version = stream.getUint16();
		parameters.xAvgCharWidth = stream.getInt16();
		parameters.usWeightClass = stream.getUint16();
		parameters.usWidthClass = stream.getUint16();
		parameters.fsType = stream.getUint16();
		parameters.ySubscriptXSize = stream.getInt16();
		parameters.ySubscriptYSize = stream.getInt16();
		parameters.ySubscriptXOffset = stream.getInt16();
		parameters.ySubscriptYOffset = stream.getInt16();
		parameters.ySuperscriptXSize = stream.getInt16();
		parameters.ySuperscriptYSize = stream.getInt16();
		parameters.ySuperscriptXOffset = stream.getInt16();
		parameters.ySuperscriptYOffset = stream.getInt16();
		parameters.yStrikeoutSize = stream.getInt16();
		parameters.yStrikeoutPosition = stream.getInt16();
		parameters.sFamilyClass = stream.getInt16();
		parameters.panose = stream.getBlock(10);
		parameters.ulUnicodeRange1 = stream.getUint32();
		parameters.ulUnicodeRange2 = stream.getUint32();
		parameters.ulUnicodeRange3 = stream.getUint32();
		parameters.ulUnicodeRange4 = stream.getUint32();
		parameters.achVendID = stream.getUint32();
		parameters.fsSelection = stream.getUint16();
		parameters.usFirstCharIndex = stream.getUint16();
		parameters.usLastCharIndex = stream.getUint16();
		parameters.sTypoAscender = stream.getInt16();
		parameters.sTypoDescender = stream.getInt16();
		parameters.sTypoLineGap = stream.getInt16();
		parameters.usWinAscent = stream.getUint16();
		parameters.usWinDescent = stream.getUint16();
		//#endregion

		//#region Parse "version = 1" parameters
		if (parameters.version >= 1) {
			parameters.ulCodePageRange1 = stream.getUint32();
			parameters.ulCodePageRange2 = stream.getUint32();
		}
		//#endregion

		//#region Parse "version = 2" (and also v3 and v4) parameters
		if (parameters.version >= 2) {
			parameters.sxHeight = stream.getInt16();
			parameters.sCapHeight = stream.getInt16();
			parameters.usDefaultChar = stream.getUint16();
			parameters.usBreakChar = stream.getUint16();
			parameters.usMaxContext = stream.getUint16();
		}
		//#endregion

		//#region Parse "version = 5" parameters
		if (parameters.version >= 5) {
			parameters.usLowerOpticalPointSize = stream.getUint16();
			parameters.usUpperOpticalPointSize = stream.getUint16();
		}
		//#endregion

		return new OS2(parameters);
	}

}

