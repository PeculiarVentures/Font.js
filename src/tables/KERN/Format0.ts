import { SeqStream } from "bytestreamjs";
import { KERNFormat, KERNFormatParameters } from "./Format";

export interface KERNFormat0Value {
	left: number;
	right: number;
	value: number;
}

export interface KERNFormat0Parameters extends KERNFormatParameters {
	nPairs?: number;
	searchRange?: number;
	entrySelector?: number;
	rangeShift?: number;
	values?: KERNFormat0Value[];
}

export class KERNFormat0 extends KERNFormat {

	public nPairs: number;
	public searchRange: number;
	public entrySelector: number;
	public rangeShift: number;
	public values: KERNFormat0Value[];

	constructor(parameters: KERNFormat0Parameters = {}) {
		super(parameters);

		this.nPairs = parameters.nPairs || 0;
		this.searchRange = parameters.searchRange || 0;
		this.entrySelector = parameters.entrySelector || 0;
		this.rangeShift = parameters.rangeShift || 0;
		this.values = parameters.values || [];
	}

	public static get format() {
		return 0;
	}

	public toStream(stream: SeqStream): boolean {
		const size = this.map.size;

		stream.appendUint16(size);

		const log2TablesSize = Math.floor(Math.log2(size));
		const highestPowerOf2 = Math.pow(2, log2TablesSize);

		stream.appendUint16(highestPowerOf2 << 4); // searchRange
		stream.appendUint16(log2TablesSize); // entrySelector
		stream.appendUint16((size - highestPowerOf2) << 4); // rangeShift

		for (const [key, value] of this.map.entries()) {
			const pair = /(\d+)-(\d+)/g.exec(key);
			if (!pair || pair.length !== 3) {
				throw new Error("Incorrectly formatted map for KERN - format 0");
			}

			stream.appendUint16(+pair[1]); // left // TODO Improve string converting to number
			stream.appendUint16(+pair[2]); // right
			stream.appendUint16(value);
		}

		return true;
	}

	public static fromStream(stream: SeqStream): KERNFormat0 {
		const parameters: KERNFormat0Parameters = {};

		parameters.nPairs = stream.getUint16();
		parameters.searchRange = stream.getUint16();
		parameters.entrySelector = stream.getUint16();
		parameters.rangeShift = stream.getUint16();
		parameters.map = new Map();
		parameters.values = [];

		for (let j = 0; j < parameters.nPairs; j++) {
			const value = {
				left: stream.getUint16(),
				right: stream.getUint16(),
				value: stream.getInt16(),
			};

			parameters.values.push(value);
			parameters.map.set(`${value.left}-${value.right}`, value.value);
		}

		return new KERNFormat0(parameters);
	}

}
