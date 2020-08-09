import { SeqStream } from "../bytestreamjs/bytestream.js";
import { BaseClass } from "./BaseClass.js";
import { Font } from "./Font.js";
//**************************************************************************************
export class FontCollection extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		this.ttcTag = parameters.ttcTag || 0x74746366;
		this.majorVersion = parameters.majorVersion || 0;
		this.minorVersion = parameters.minorVersion || 0;
		this.fonts = parameters.fonts || [];

		if("dsigTag" in parameters)
		{
			this.dsigTag = parameters.dsigTag || 0x44534947;
			this.dsigLength = parameters.dsigLength || 0;
			this.dsigOffset = parameters.dsigOffset || 0;
		}
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 *
	 * @param {!SeqStream} stream
	 *
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
		//region Initial variables
		const offsets = [];
		const fontStream = new SeqStream();

		let constOffset = 12 + this.fonts.length * 4;
		if(this.majorVersion === 2)
			constOffset += 12;
		//endregion

		//region Fill stream with all values for fonts
		for(const font of this.fonts)
		{
			offsets.push(fontStream.start);
			font.toStream(fontStream, fontStream.start + constOffset);
		}
		//endregion

		//region Put font collection header values
		stream.appendUint32(this.ttcTag);
		stream.appendUint16(this.majorVersion);
		stream.appendUint16(this.minorVersion);
		//endregion

		//region Put information about font offsets
		stream.appendUint32(this.fonts.length);

		for(const offset of offsets)
			stream.appendUint32(offset + constOffset);
		//endregion

		//region Put additional information about DSIG table if needed
		if(this.majorVersion === 2)
		{
			stream.appendUint32(this.dsigTag);
			stream.appendUint32(this.dsigLength);
			stream.appendUint32(this.dsigOffset);
		}
		//endregion

		//region Append stream with all font data
		stream.append(fontStream.stream);
		//endregion

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
		const result = { fonts: [] };

		result.ttcTag = stream.getUint32();
		result.majorVersion = stream.getUint16();
		result.minorVersion = stream.getUint16();

		const numFonts = stream.getUint32();
		const offsetTable = [];

		for(let i = 0; i < numFonts; i++)
		{
			const offset = stream.getUint32();
			offsetTable.push(offset);
		}

		if(result.majorVersion === 2)
		{
			result.dsigTag = stream.getUint32();
			result.dsigLength = stream.getUint32();
			result.dsigOffset = stream.getUint32();
		}

		for(const offset of offsetTable)
		{
			stream.start = offset;
			result.fonts.push(Font.fromStream(stream));
		}

		return new FontCollection(result);
	}
	//**********************************************************************************
}
//**************************************************************************************