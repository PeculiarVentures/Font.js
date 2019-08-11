import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass.js";
//**************************************************************************************
export class OS2 extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
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
		this.panose = parameters.panose || 0;
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

		if(this.version >= 1)
		{
			this.ulCodePageRange1 = parameters.ulCodePageRange1 || 0;
			this.ulCodePageRange2 = parameters.ulCodePageRange2 || 0;
		}

		if(this.version >= 2)
		{
			this.sxHeight = parameters.sxHeight || 0;
			this.sCapHeight = parameters.sCapHeight || 0;
			this.usDefaultChar = parameters.usDefaultChar || 0;
			this.usBreakChar = parameters.usBreakChar || 0;
			this.usMaxContext = parameters.usMaxContext || 0;
		}

		if(this.version >= 5)
		{
			this.usLowerOpticalPointSize = parameters.usLowerOpticalPointSize || 0;
			this.usUpperOpticalPointSize = parameters.usUpperOpticalPointSize || 0;
		}
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x4F532F32;
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
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
		stream.appendView(new Uint8Array(this.panose));
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

		if(this.version >= 1)
		{
			stream.appendUint32(this.ulCodePageRange1);
			stream.appendUint32(this.ulCodePageRange2);
		}

		if(this.version >= 2)
		{
			stream.appendInt16(this.sxHeight);
			stream.appendInt16(this.sCapHeight);
			stream.appendUint16(this.usDefaultChar);
			stream.appendUint16(this.usBreakChar);
			stream.appendUint16(this.usMaxContext);
		}

		if(this.version >= 5)
		{
			stream.appendUint16(this.usLowerOpticalPointSize);
			stream.appendUint16(this.usUpperOpticalPointSize);
		}

		return true;
	}
	//**********************************************************************************
	/**
	 * Convert SeqStream data to object
	 * @param {!SeqStream} stream
	 * @returns {*} Result of the function
	 */
	static fromStream(stream)
	{
		//region Initial variables
		const parameters = {};
		//endregion

		//region Parse "version = 0" parameters
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
		//endregion

		//region Parse "version = 1" parameters
		if(parameters.version >= 1)
		{
			parameters.ulCodePageRange1 = stream.getUint32();
			parameters.ulCodePageRange2 = stream.getUint32();
		}
		//endregion

		//region Parse "version = 2" (and also v3 and v4) parameters
		if(parameters.version >= 2)
		{
			parameters.sxHeight = stream.getInt16();
			parameters.sCapHeight = stream.getInt16();
			parameters.usDefaultChar = stream.getUint16();
			parameters.usBreakChar = stream.getUint16();
			parameters.usMaxContext = stream.getUint16();
		}
		//endregion

		//region Parse "version = 5" parameters
		if(parameters.version >= 5)
		{
			parameters.usLowerOpticalPointSize = stream.getUint16();
			parameters.usUpperOpticalPointSize = stream.getUint16();
		}
		//endregion

		return new OS2(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
