import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass.js";
import { getLongDateTime, appendLongDateTime, getFixed } from "../common.js";
//**************************************************************************************
export class HEAD extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		const now = (new Date()) / 1000 + 2082844800;
		
		this.version = parameters.version || 0x00010000;
		this.fontRevision = parameters.fontRevision || 0x00010000;
		this.checkSumAdjustment = parameters.checkSumAdjustment || 0;
		this.magicNumber = parameters.magicNumber || 0x5F0F3CF5;
		this.flags = parameters.flags || 0;
		this.unitsPerEm = parameters.unitsPerEm || 2048;
		this.created = parameters.created || now;
		this.modified = parameters.modified || now;
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
	//**********************************************************************************
	static get tag()
	{
		return 0x68656164;
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
		stream.appendUint32(this.version);
		stream.appendUint32(this.fontRevision);

		//region The "checkSumAdjustment" need to be calculated later in "Font.toStream"
		stream.appendUint32(0);
		//endregion

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
	//**********************************************************************************
	/**
	 * Convert SeqStream data to object
	 * @param {!SeqStream} stream
	 * @returns {*} Result of the function
	 */
	static fromStream(stream)
	{
		const version = stream.getUint32();
		const fontRevision = stream.getUint32();
		const checkSumAdjustment = stream.getUint32();
		const magicNumber = stream.getUint32();
		const flags = stream.getUint16();
		const unitsPerEm = stream.getUint16();
		const created = getLongDateTime(stream);
		const modified = getLongDateTime(stream);
		const xMin = stream.getInt16();
		const yMin = stream.getInt16();
		const xMax = stream.getInt16();
		const yMax = stream.getInt16();
		const macStyle = stream.getUint16();
		const lowestRecPPEM = stream.getUint16();
		const fontDirectionHint = stream.getInt16();
		const indexToLocFormat = stream.getInt16();
		const glyphDataFormat = stream.getInt16();

		return new HEAD({
			version,
			fontRevision,
			checkSumAdjustment,
			magicNumber,
			flags,
			unitsPerEm,
			created,
			modified,
			xMin,
			yMin,
			xMax,
			yMax,
			macStyle,
			lowestRecPPEM,
			fontDirectionHint,
			indexToLocFormat,
			glyphDataFormat
		});
	}
	//**********************************************************************************
}
//**************************************************************************************
