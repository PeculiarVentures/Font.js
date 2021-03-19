import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../../BaseClass";
import { CMAPSubTable } from "./CMAPSubTable";
import { Format14 } from "./Format14";
import { Format0 } from "./Format0";
import { Format12 } from "./Format12";
import { Format4 } from "./Format4";
import { Format6 } from "./Format6";

export interface CMAPParameters {
	version?: number;
	subTables?: CMAPSubTable[];
}

export class CMAP extends BaseClass {

	public version: number;
	public subTables: CMAPSubTable[];
	public format?: number; // TODO Used in Font
	public language = 0; // TODO Used in Font
	public platformID?: number | undefined; // TODO Used in Font
	public platformSpecificID?: number | undefined; // TODO Used in Font
	public firstCode?: number | undefined; // TODO Used in Font

	constructor(parameters: CMAPParameters = {}) {
		super();

		this.version = parameters.version || 0;
		this.subTables = parameters.subTables || [];
	}

	static get className() {
		return "CMAP";
	}

	static get tag() {
		return 0x636D6170;
	}

	public toStream(stream: SeqStream): boolean {
		stream.appendUint16(this.version);
		stream.appendUint16(this.subTables.length);

		const subTablesHeader = new SeqStream();
		const subTablesData = new SeqStream();

		for (const subTable of this.subTables) {
			if (subTable === null) {
				continue;
			}

			const offset = 4 + (this.subTables.length * 8) + subTablesData.length;

			const subTableStream = new SeqStream();

			const tableResult = subTable.toStream(subTableStream);
			if (tableResult !== true)
				throw new Error(`Error while processing ${(subTable.constructor as typeof CMAPSubTable).className}`);

			subTablesHeader.appendUint16(subTable.platformID);
			subTablesHeader.appendUint16(subTable.platformSpecificID);
			subTablesHeader.appendUint32(offset);

			subTablesData.appendView(new Uint8Array(subTableStream.buffer));
		}

		stream.appendView(new Uint8Array(subTablesHeader.buffer));
		stream.appendView(new Uint8Array(subTablesData.buffer));

		return true;
	}

	public static fromStream(stream: SeqStream): CMAP {
		const version = stream.getUint16();
		const numberSubtables = stream.getUint16();

		const subTables: CMAPSubTable[] = [];
		for (let i = 0; i < numberSubtables; i++) {
			const platformID = stream.getUint16();
			const platformSpecificID = stream.getUint16();
			const offset = stream.getUint32();

			const subTableStream = new SeqStream({ stream: stream.stream.slice(offset) });

			//#region Parse subtable
			const format = subTableStream.getUint16();

			let subTable: CMAPSubTable;

			switch (format) {
				case 0:
					subTable = Format0.fromStream(subTableStream);
					break;
				case 4:
					subTable = Format4.fromStream(subTableStream);
					break;
				case 6:
					subTable = Format6.fromStream(subTableStream);
					break;
				case 12:
					subTable = Format12.fromStream(subTableStream);
					break;
				case 14:
					subTable = Format14.fromStream(subTableStream);
					break;
				default:
					console.log(`Unknown CMAP subtable format - ${format}`); // TODO Don't use console
					subTable = new CMAPSubTable(); // TODO Added by @microshine
				//throw new Error(`Unknown CMAP subtable format - ${format}`);
			}

			//#region Set upper lever subtable-specific information
			subTable.format = format;
			subTable.platformID = platformID;
			subTable.platformSpecificID = platformSpecificID;
			//#endregion

			subTables[i] = subTable;
			//#endregion
		}

		return new CMAP({
			version,
			subTables
		});
	}

	public gid(code: number, platformID = 3, platformSpecificID = 1): number {
		// Replace absent chars via GID = 0 (as it is required by standard)
		let result = 0;

		for (const subTable of this.subTables) {
			if ((subTable.platformID === platformID) && (subTable.platformSpecificID === platformSpecificID)) {
				result = subTable.gid(code);
				break;
			}
		}

		return result;
	}

	public code(gid: number, platformID = 3, platformSpecificID = 1) {
		let result = [];

		for (const subTable of this.subTables) {
			if ((subTable.platformID === platformID) && (subTable.platformSpecificID === platformSpecificID)) {
				result = subTable.code(gid);
				break;
			}
		}

		return result;
	}

}
