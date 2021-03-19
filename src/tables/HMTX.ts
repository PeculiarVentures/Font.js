import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass";

export interface HMTXMetrix {
	advanceWidth: number;
	leftSideBearing: number;
}

export interface HMTXParameters {
	hMetrics?: HMTXMetrix[];
	leftSideBearings?: number[];
}

export class HMTX extends BaseClass {

	public hMetrics: HMTXMetrix[];
	public leftSideBearings: number[];

	constructor(parameters: HMTXParameters = {}) {
		super();

		this.hMetrics = parameters.hMetrics || [];
		this.leftSideBearings = parameters.leftSideBearings || [];
	}

	public static get tag() {
		return 0x686D7478;
	}

	public toStream(stream: SeqStream) {
		for (let i = 0; i < this.hMetrics.length; i++) {
			stream.appendUint16(this.hMetrics[i].advanceWidth);
			stream.appendInt16(this.hMetrics[i].leftSideBearing);
		}

		for (let i = 0; i < this.leftSideBearings.length; i++)
			stream.appendInt16(this.leftSideBearings[i]);

		return true;
	}

	/**
	 * Convert SeqStream data to object
	 * @param stream
	 * @param numGlyphs The value is found in the 'maxp' table
	 * @param numOfLongHorMetrics The value is found in the 'hhea' (Horizontal Header) table
	 */
	static fromStream(stream: SeqStream, numGlyphs: number, numOfLongHorMetrics: number) {
		const parameters: HMTXParameters = {};

		parameters.hMetrics = [];
		parameters.leftSideBearings = [];

		for (let i = 0; i < numOfLongHorMetrics; i++) {
			const hMetrics = {
				advanceWidth: stream.getUint16(),
				leftSideBearing: stream.getInt16(),
			};

			parameters.hMetrics.push(hMetrics);
		}

		for (let i = 0; i < (numGlyphs - numOfLongHorMetrics); i++) {
			const value = stream.getInt16();

			parameters.leftSideBearings.push(value);
		}

		return new HMTX(parameters);
	}

}
