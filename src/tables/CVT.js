import { BaseClass } from "../BaseClass.js";
//**************************************************************************************
export class CVT extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.values = parameters.values || [];
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x63767420;
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
		for(const value of this.values)
			stream.appendInt16(value);

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
		const parameters = {
			values: []
		};

		while(stream.length)
		{
			const value = stream.getInt16();
			parameters.values.push(value);
		}

		return new CVT(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
