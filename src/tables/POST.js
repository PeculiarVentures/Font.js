import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass.js";
//**************************************************************************************
export class POST extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.version = parameters.version || 0x00010000;
		this.italicAngle = parameters.italicAngle || 0;
		this.underlinePosition = parameters.underlinePosition || 0;
		this.underlineThickness = parameters.underlineThickness || 0;
		this.isFixedPitch = parameters.isFixedPitch || 0;
		this.minMemType42 = parameters.minMemType42 || 0;
		this.maxMemType42 = parameters.maxMemType42 || 0;
		this.minMemType1 = parameters.minMemType1 || 0;
		this.maxMemType1 = parameters.maxMemType1 || 0;

		if(this.version === 0x00020000)
		{
			this.glyphNameIndex = parameters.glyphNameIndex || [];
			this.names = parameters.names || [];
		}
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x706F7374;
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
		stream.appendUint32(this.italicAngle);
		stream.appendInt16(this.underlinePosition);
		stream.appendInt16(this.underlineThickness);
		stream.appendUint32(this.isFixedPitch);
		stream.appendUint32(this.minMemType42);
		stream.appendUint32(this.maxMemType42);
		stream.appendUint32(this.minMemType1);
		stream.appendUint32(this.maxMemType1);

		if(this.version === 0x00020000)
		{
			stream.appendUint16(this.glyphNameIndex.length);

			if(this.glyphNameIndex.length)
			{
				for(const index of this.glyphNameIndex)
					stream.appendUint16(index);

				for(const name of this.names)
				{
					stream.appendView(new Uint8Array([name.length]));
					stream.appendView(new Uint8Array(name));
				}
			}
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

		//region Parse major parameters
		parameters.version = stream.getUint32();
		parameters.italicAngle = stream.getUint32();
		parameters.underlinePosition = stream.getInt16();
		parameters.underlineThickness = stream.getInt16();
		parameters.isFixedPitch = stream.getUint32();
		parameters.minMemType42 = stream.getUint32();
		parameters.maxMemType42 = stream.getUint32();
		parameters.minMemType1 = stream.getUint32();
		parameters.maxMemType1 = stream.getUint32();
		//endregion

		//region Parse parameters specific "version = 2"
		if(parameters.version === 0x00020000)
		{
			parameters.numberOfGlyphs = stream.getUint16();

			parameters.glyphNameIndex = [];

			for(let i = 0; i < parameters.numberOfGlyphs; i++)
			{
				const value = stream.getUint16();
				parameters.glyphNameIndex.push(value);
			}

			parameters.names = [];

			for(let i = 0; i < parameters.numberOfGlyphs; i++)
			{
				const length = (stream.getBlock(1))[0];
				const value = stream.getBlock(length);

				parameters.names.push(value);
			}
		}
		//endregion
		
		return new POST(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
