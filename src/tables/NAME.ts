import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass";

export interface NAMERecord {
	platformID: number;
	platformSpecificID?: number;
	languageID?: number;
	nameID: number;
	length?: number;
	offset?: number;
	value: number[];
}

export interface NAMEParameters {
	format?: number;
	count?: number;
	stringOffset?: number;
	nameRecords?: NAMERecord[];
}

export class NAME extends BaseClass {
	format: number;
	count: number;
	stringOffset: number;
	nameRecords: NAMERecord[];

	constructor(parameters: NAMEParameters = {}) {
		super();

		this.format = parameters.format || 0;
		this.count = parameters.count || 0;
		this.stringOffset = parameters.stringOffset || 0;
		this.nameRecords = parameters.nameRecords || [];
	}

	public static get tag() {
		return 0x6E616D65;
	}

	public toStream(stream: SeqStream): boolean {
		stream.appendUint16(this.format);
		stream.appendUint16(this.nameRecords.length);
		stream.appendUint16(6 + (this.nameRecords.length * 12));

		let offset = 0;
		let values: number[] = [];

		for (const nameRecord of this.nameRecords) {
			stream.appendUint16(nameRecord.platformID);
			stream.appendUint16(nameRecord.platformSpecificID || 0);
			stream.appendUint16(nameRecord.languageID || 0);
			stream.appendUint16(nameRecord.nameID);
			stream.appendUint16(nameRecord.value.length);
			stream.appendUint16(offset);

			values = values.concat(nameRecord.value);

			offset += nameRecord.value.length;
		}

		stream.appendView(new Uint8Array(values));

		return true;
	}

	public static fromStream(stream: SeqStream): NAME {
		const format = stream.getUint16();
		const count = stream.getUint16();
		const stringOffset = stream.getUint16();

		const nameRecords = [];

		for (let i = 0; i < count; i++) {
			const platformID = stream.getUint16();
			const platformSpecificID = stream.getUint16();
			const languageID = stream.getUint16();
			const nameID = stream.getUint16();
			const length = stream.getUint16();
			const offset = stream.getUint16();

			const buffer = stream.stream.buffer.slice(stringOffset + offset, stringOffset + offset + length);
			const value = Array.from(new Uint8Array(buffer));

			nameRecords.push({
				platformID,
				platformSpecificID,
				languageID,
				nameID,
				length,
				offset,
				value
			});
		}

		return new NAME({
			format,
			count,
			stringOffset,
			nameRecords
		});
	}

}

