import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass";

export interface HHEAParameters {
	version?: number;
	ascent?: number;
	descent?: number;
	lineGap?: number;
	advanceWidthMax?: number;
	minLeftSideBearing?: number;
	minRightSideBearing?: number;
	xMaxExtent?: number;
	caretSlopeRise?: number;
	caretSlopeRun?: number;
	caretOffset?: number;
	reserved1?: number;
	reserved2?: number;
	reserved3?: number;
	reserved4?: number;
	metricDataFormat?: number;
	numOfLongHorMetrics?: number;
}

export class HHEA extends BaseClass {

	public version: number;
	public ascent: number;
	public descent: number;
	public lineGap: number;
	public advanceWidthMax: number;
	public minLeftSideBearing: number;
	public minRightSideBearing: number;
	public xMaxExtent: number;
	public caretSlopeRise: number;
	public caretSlopeRun: number;
	public caretOffset: number;
	public reserved1: number;
	public reserved2: number;
	public reserved3: number;
	public reserved4: number;
	public metricDataFormat: number;
	public numOfLongHorMetrics: number;


	constructor(parameters: HHEAParameters = {}) {
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
		this.reserved1 = parameters.reserved1 || 0;
		this.reserved2 = parameters.reserved2 || 0;
		this.reserved3 = parameters.reserved3 || 0;
		this.reserved4 = parameters.reserved4 || 0;
		this.metricDataFormat = parameters.metricDataFormat || 0;
		this.numOfLongHorMetrics = parameters.numOfLongHorMetrics || 0;
	}

	static get tag() {
		return 0x68686561;
	}

	public toStream(stream: SeqStream) {
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
		stream.appendInt16(this.reserved1);
		stream.appendInt16(this.reserved2);
		stream.appendInt16(this.reserved3);
		stream.appendInt16(this.reserved4);
		stream.appendInt16(this.metricDataFormat);
		stream.appendUint16(this.numOfLongHorMetrics);

		return true;
	}

	public static fromStream(stream: SeqStream) {
		const parameters: HHEAParameters = {};

		parameters.version = stream.getUint32();
		parameters.ascent = stream.getInt16();
		parameters.descent = stream.getInt16();
		parameters.lineGap = stream.getInt16();
		parameters.advanceWidthMax = stream.getUint16();
		parameters.minLeftSideBearing = stream.getInt16();
		parameters.minRightSideBearing = stream.getInt16();
		parameters.xMaxExtent = stream.getInt16();
		parameters.caretSlopeRise = stream.getInt16();
		parameters.caretSlopeRun = stream.getInt16();
		parameters.caretOffset = stream.getInt16();
		parameters.reserved1 = stream.getInt16();
		parameters.reserved2 = stream.getInt16();
		parameters.reserved3 = stream.getInt16();
		parameters.reserved4 = stream.getInt16();
		parameters.metricDataFormat = stream.getInt16();
		parameters.numOfLongHorMetrics = stream.getUint16();

		return new HHEA(parameters);
	}

}
