import { SeqStream } from "bytestreamjs";
import { FontTable } from "../Table";

export interface HDMXRecord {
	widths: Uint8Array;
	pixelSize: number;
	maxWidth: number;
}

export interface HDMXParameters {
	version?: number;
	records?: HDMXRecord[];
}

export class HDMX extends FontTable {

	public version: number;
	public records: HDMXRecord[];

	constructor(parameters: HDMXParameters = {}) {
		super();

		this.version = parameters.version || 0;
		this.records = parameters.records || [];
	}

	public static get tag() {
		return 0x68646D78;
	}

	public toStream(stream: SeqStream): boolean {
		try {
			if (this.version !== 0) {
				throw new Error(`Incorrect version for 'hdmx' table: ${this.version}`);
			}

			stream.appendUint16(this.version);
			stream.appendUint16(this.records.length);

			//#region Set correct "sizeDeviceRecord" aligned to long
			const sizeDeviceRecordControl = (this.records[0].widths.length + 2);
			let sizeDeviceRecordPadding = [];

			if (sizeDeviceRecordControl % 4)
				sizeDeviceRecordPadding = new Array(4 - (sizeDeviceRecordControl % 4));
			//#endregion

			if (this.records.length)
				stream.appendInt32(this.records[0].widths.length + 2 + sizeDeviceRecordPadding.length);
			else
				stream.appendInt32(0);

			for (const record of this.records) {
				stream.appendView(new Uint8Array([record.pixelSize, record.maxWidth, ...record.widths]));
				stream.appendView(new Uint8Array(sizeDeviceRecordPadding));
			}

			return true;
		} catch (e) {
			if (e instanceof Error) {
				e.message = `Failed to execute 'toStream' on 'HDMX'. ${e.message}`;
				throw e;
			}

			throw new Error("Failed to execute 'toStream' on 'HDMX'");
		}
	}

	public static fromStream(stream: SeqStream, numGlyphs: number): HDMX {
		try {
			const parameters: HDMXParameters = {};

			parameters.version = stream.getInt16();

			const numRecords = stream.getInt16();
			const sizeDeviceRecord = stream.getInt32();

			const sizeDeviceRecordControl = (numGlyphs + 2);
			let sizeDeviceRecordPadding = 0;

			if (sizeDeviceRecordControl % 4) {
				sizeDeviceRecordPadding = 4 - (sizeDeviceRecordControl % 4);
			}

			if (sizeDeviceRecord !== (sizeDeviceRecordControl + sizeDeviceRecordPadding)) {
				throw new Error(`Incorrect sizeDeviceRecord: ${sizeDeviceRecord}`);
			}

			if (stream.length !== (numRecords * sizeDeviceRecord)) {
				throw new Error("Not enough space for (numRecords * sizeDeviceRecord)");
			}

			if (parameters.version === 0) {
				parameters.records = [];

				for (let i = 0; i < numRecords; i++) {
					const record = {
						pixelSize: (stream.getBlock(1))[0],
						maxWidth: (stream.getBlock(1))[0],
						widths: stream.getBlock(numGlyphs),
					};


					stream.getBlock(sizeDeviceRecordPadding);

					parameters.records.push(record);
				}
			} else {
				throw new Error(`Incorrect version for 'hdmx' table: ${parameters.version}`);
			}

			return new HDMX(parameters);
		} catch (e) {
			const error = "Failed to execute 'fromStream' on 'HDMX'";
			if (e instanceof Error) {
				e.message = `${error}. ${e.message}`;
				throw e;
			}

			throw new Error(error);
		}
	}

}
