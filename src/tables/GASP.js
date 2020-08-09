import { SeqStream } from "../../bytestreamjs/bytestream.js";
import { BaseClass } from "../BaseClass.js";
//**************************************************************************************
export class RangeGaspBehaviorFlags
{
	//**********************************************************************************
	constructor()
	{
		throw new Error("Only static methods allowed for RangeGaspBehaviorFlags");
	}
	//**********************************************************************************
	/**
	 * Use gridfitting
	 *
	 * @return {number}
	 */
	static get GASP_GRIDFIT()
	{
		return 0x0001;
	}
	//**********************************************************************************
	/**
	 * Use grayscale rendering
	 *
	 * @return {number}
	 */
	static get GASP_DOGRAY()
	{
		return 0x0002;
	}
	//**********************************************************************************
	/**
	 * Use gridfitting with ClearType symmetric smoothing. Only supported in version 1 'gasp'
	 *
	 * @return {number}
	 */
	static get GASP_SYMMETRIC_GRIDFIT()
	{
		return 0x0004;
	}
	//**********************************************************************************
	/**
	 * Use smoothing along multiple axes with ClearType. Only supported in version 1 'gasp'
	 *
	 * @return {number}
	 */
	static get GASP_SYMMETRIC_SMOOTHING()
	{
		return 0x0008;
	}
	//**********************************************************************************
}
//**************************************************************************************
export class GASP extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.version = parameters.version || 0x0001;
		this.gaspRanges = parameters.gaspRanges || [];
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x67617370;
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
		stream.appendUint16(this.version);
		stream.appendUint16(this.gaspRanges.length);

		for(const range of this.gaspRanges)
		{
			stream.appendUint16(range.rangeMaxPPEM);
			stream.appendUint16(range.rangeGaspBehavior);
		}

		return true;
	}
	//**********************************************************************************
	/**
	 * Convert SeqStream data to object
	 *
	 * @param {!SeqStream} stream
	 *
	 * @returns {*} Result of the function
	 */
	static fromStream(stream)
	{
		const version = stream.getUint16();
		const numRanges = stream.getUint16();
		const gaspRanges = [];

		for(let i = 0; i < numRanges; i++)
		{
			const gaspRange = {};

			gaspRange.rangeMaxPPEM = stream.getUint16();
			gaspRange.rangeGaspBehavior = stream.getUint16();

			gaspRanges.push(gaspRange);
		}

		return new GASP({
			version,
			gaspRanges
		});
	}
	//**********************************************************************************
}
//**************************************************************************************
