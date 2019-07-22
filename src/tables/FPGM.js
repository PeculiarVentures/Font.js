import { BaseClass } from "../BaseClass.js";
//**************************************************************************************
export class FPGM extends BaseClass
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
		return 0x6670676D;
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
		stream.appendView(new Uint8Array(this.values));

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

		parameters.values = stream.getBlock(stream.length);

		return new FPGM(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
