import { BaseClass } from "../BaseClass.js";
//**************************************************************************************
export class LOCA extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.offsets = parameters.offsets || [];
		this.indexToLocFormat = parameters.indexToLocFormat || 0;
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x6C6F6361;
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
		switch(this.indexToLocFormat)
		{
			case 0:
				for(const offset of this.offsets)
					stream.appendUint16(offset >> 1);

				break;
			case 1:
				for(const offset of this.offsets)
					stream.appendUint32(offset);

				break;
			default:
				throw new Error(`Incorrect 'indexToLocFormat' value: ${this.indexToLocFormat}`);
		}

		return true;
	}
	//**********************************************************************************
	/**
	 * Convert SeqStream data to object
	 * @param {!number} indexToLocFormat Value from 'head' table
	 * @param {!number} numGlyphs Value from 'maxp' table
	 * @param {!SeqStream} stream
	 * @returns {*} Result of the function
	 */
	static fromStream(indexToLocFormat, numGlyphs, stream)
	{
		const offsets = [];

		switch(indexToLocFormat)
		{
			case 0:
				{
					for(let i = 0; i < (numGlyphs + 1); i++)
					{
						const offset = stream.getUint16();
						offsets.push(offset << 1);
					}
				}
				break;
			case 1:
				{
					for(let i = 0; i < (numGlyphs + 1); i++)
					{
						const offset = stream.getUint32();
						offsets.push(offset);
					}
				}
				break;
			default:
				throw new Error(`Incorrect value for indexToLocFormat: ${indexToLocFormat}`);
		}

		return new LOCA({
			indexToLocFormat,
			offsets
		});
	}
	//**********************************************************************************
}
//**************************************************************************************
