import { SeqStream } from "bytestreamjs";
import { FontTable } from "../Table";

export interface LOCAParameters {
	offsets?: number[];
	indexToLocFormat?: number;
}

export class LOCA extends FontTable {

	public offsets: number[];
	public indexToLocFormat: number;

	constructor(parameters: LOCAParameters = {}) {
		super();

		this.offsets = parameters.offsets || [];
		this.indexToLocFormat = parameters.indexToLocFormat || 0;
	}

	public static get tag() {
		return 0x6C6F6361;
	}

	public toStream(stream: SeqStream) {
		switch (this.indexToLocFormat) {
			case 0:
				for (const offset of this.offsets)
					stream.appendUint16(offset >> 1);

				break;
			case 1:
				for (const offset of this.offsets)
					stream.appendUint32(offset);

				break;
			default:
				throw new Error(`Incorrect 'indexToLocFormat' value: ${this.indexToLocFormat}`);
		}

		return true;
	}

	/**
	 * Convert SeqStream data to object
	 * @param stream
	 * @param indexToLocFormat Value from 'head' table
	 * @param numGlyphs Value from 'maxp' table
	 * @returns Result of the function
	 */
	static fromStream(stream: SeqStream, indexToLocFormat: number, numGlyphs: number): LOCA {
		const offsets: number[] = [];

		switch (indexToLocFormat) {
			case 0:
				{
					for (let i = 0; i < (numGlyphs + 1); i++) {
						const offset = stream.getUint16();
						offsets.push(offset << 1);
					}
				}
				break;
			case 1:
				{
					for (let i = 0; i < (numGlyphs + 1); i++) {
						const offset = stream.getUint32();
						offsets.push(offset);
					}
				}
				break;
			default:
				throw new Error(`Incorrect value for indexToLocFormat: ${indexToLocFormat}`);
		}

		return new LOCA({
			indexToLocFormat,
			offsets
		});
	}

}

