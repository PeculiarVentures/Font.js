import { BaseClass } from "../BaseClass.js";
//**************************************************************************************
export class HHEA extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.version = parameters.version || 0x00010000;
		this.ascent = parameters.ascent || 0;
		this.descent = parameters.descent || 0;
		this.lineGap = parameters.lineGap || 0;
		this.advanceWidthMax = parameters.advanceWidthMax || 0;
		this.minLeftSideBearing = parameters.minLeftSideBearing || 0;
		this.minRightSideBearing = parameters.minRightSideBearing || 0;
		this.xMaxExtent = parameters.xMaxExtent || 0;
		this.caretSlopeRise = parameters.caretSlopeRise || 0;
		this.caretSlopeRun = parameters.caretSlopeRun || 0;
		this.caretOffset = parameters.caretOffset || 0;
		this.metricDataFormat = parameters.metricDataFormat || 0;
		this.numOfLongHorMetrics = parameters.numOfLongHorMetrics || 0;
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x68686561;
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
		stream.appendInt16(this.ascent);
		stream.appendInt16(this.descent);
		stream.appendInt16(this.lineGap);
		stream.appendUint16(this.advanceWidthMax);
		stream.appendInt16(this.minLeftSideBearing);
		stream.appendInt16(this.minRightSideBearing);
		stream.appendInt16(this.xMaxExtent);
		stream.appendInt16(this.caretSlopeRise);
		stream.appendInt16(this.caretSlopeRun);
		stream.appendInt16(this.caretOffset);
		stream.appendInt16(0);
		stream.appendInt16(0);
		stream.appendInt16(0);
		stream.appendInt16(0);
		stream.appendInt16(this.metricDataFormat);
		stream.appendUint16(this.numOfLongHorMetrics);

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
		const ascent = stream.getInt16();
		const descent = stream.getInt16();
		const lineGap = stream.getInt16();
		const advanceWidthMax = stream.getUint16();
		const minLeftSideBearing = stream.getInt16();
		const minRightSideBearing = stream.getInt16();
		const xMaxExtent = stream.getInt16();
		const caretSlopeRise = stream.getInt16();
		const caretSlopeRun = stream.getInt16();
		const caretOffset = stream.getInt16();
		stream.getInt16(); // reserved1
		stream.getInt16(); // reserved2
		stream.getInt16(); // reserved3
		stream.getInt16(); // reserved4
		const metricDataFormat = stream.getInt16();
		const numOfLongHorMetrics = stream.getUint16();

		return new HHEA({
			version,
			ascent,
			descent,
			lineGap,
			advanceWidthMax,
			minLeftSideBearing,
			minRightSideBearing,
			xMaxExtent,
			caretSlopeRise,
			caretSlopeRun,
			caretOffset,
			metricDataFormat,
			numOfLongHorMetrics
		});
	}
	//**********************************************************************************
}
//**************************************************************************************
