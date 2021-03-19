import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../../BaseClass";

export interface INDEXParameters<TData = ArrayBuffer> {
	data?: TData[];
}

export class INDEX<TData = ArrayBuffer> extends BaseClass {

	/**
	 * Array of ArrayBuffer values having related data
	 */
	public data: TData[];

	constructor(parameters: INDEXParameters<TData> = {}) {
		super();

		this.data = parameters.data || [];
	}

	/**
	 * Convert SeqStream data to object
	 *
	 * @param stream
	 * @param version
	 *
	 * @returnsResult of the function
	 */
	public static fromStream(stream: SeqStream, version = 1): INDEX<any> {
		//#region Read INDEX header values
		let count = 0;

		switch (version) {
			case 1:
				count = stream.getUint16();
				break;
			default:
				count = stream.getUint32();
		}

		const offSize = (stream.getBlock(1))[0];
		//#endregion

		//#region Read offsets to data values
		const offsets: number[] = [];

		for (let i = 0; i <= count; i++) {
			let offset = null;

			switch (offSize) {
				case 1:
					offset = (stream.getBlock(1))[0];
					break;
				case 2:
					offset = stream.getUint16();
					break;
				case 3:
					offset = stream.getUint24();
					break;
				case 4:
					offset = stream.getUint32();
					break;
				default:
			}

			if (offset !== null)
				offsets.push(offset);
		}
		//#endregion

		//#region Read data values
		const data: ArrayBuffer[] = [];

		for (let i = 0; i < (offsets.length - 1); i++) {
			const value = stream.stream.buffer.slice(stream.start - 1 + offsets[i], stream.start - 1 + offsets[i + 1]);
			data.push(value);
		}
		//#endregion

		//#region Move stream to correct position
		stream.start = stream.start - 1 + offsets[offsets.length - 1];
		//#endregion

		return new INDEX({ data });
	}

}
