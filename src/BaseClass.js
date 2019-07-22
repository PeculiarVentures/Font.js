//**************************************************************************************
export class BaseClass
{
	//**********************************************************************************
	constructor()
	{
	}
	//**********************************************************************************
	static get className()
	{
		return "BaseClass";
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
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
		return new BaseClass();
	}
	//**********************************************************************************
}
//**************************************************************************************
