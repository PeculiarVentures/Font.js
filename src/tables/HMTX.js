import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass.js";
//**************************************************************************************
export class HMTX extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.hMetrics = parameters.hMetrics || [];
		this.leftSideBearings = parameters.leftSideBearings || [];
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x686D7478;
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
		for(let i = 0; i < this.hMetrics.length; i++)
		{
			stream.appendUint16(this.hMetrics[i].advanceWidth);
			stream.appendInt16(this.hMetrics[i].leftSideBearing);
		}

		for(let i = 0; i < this.leftSideBearings.length; i++)
			stream.appendInt16(this.leftSideBearings[i]);

		return true;
	}
	//**********************************************************************************
	/**
	 * Convert SeqStream data to object
	 * @param {!number} numGlyphs The value is found in the 'maxp' table
	 * @param {!number} numOfLongHorMetrics The value is found in the 'hhea' (Horizontal Header) table
	 * @param {!SeqStream} stream
	 * @returns {*} Result of the function
	 */
	static fromStream(numGlyphs, numOfLongHorMetrics, stream)
	{
		const parameters = {
			hMetrics: [],
			leftSideBearings: []
		};

		for(let i = 0; i < numOfLongHorMetrics; i++)
		{
			const advanceWidth = stream.getUint16();
			const leftSideBearing = stream.getInt16();

			parameters.hMetrics.push({
				advanceWidth,
				leftSideBearing
			});
		}

		for(let i = 0; i < (numGlyphs - numOfLongHorMetrics); i++)
		{
			const value = stream.getInt16();

			parameters.leftSideBearings.push(value);
		}

		return new HMTX(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
