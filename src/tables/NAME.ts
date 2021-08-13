import { SeqStream } from "bytestreamjs";
import { Convert, TextEncoding } from "pvtsutils";
import { FontTable } from "../Table";

export enum NameIDs {
	/**
	 * Copyright notice
	 */
	copyright = 0,
	/**
	 * Font Family name
	 */
	fontFamilyName = 1,
	/**
	 * Font Subfamily name
	 */
	fontSubFamilyName = 2,
	/**
	 * Unique font identifier
	 */
	uniqueFontID = 3,
	/**
	 * Full font name that reflects all family and relevant subfamily descriptors
	 */
	fullFontName = 4,
	/**
	 * Version string
	 */
	version = 5,
	/**
	 * PostScript name for the font
	 */
	postScriptFontName = 6,
	/**
	 * Trademark
	 */
	trademark = 7,
	/**
	 * Manufacturer Name
	 */
	manufacturerName = 8,
	/**
	 * Designer
	 */
	designer = 9,
	/**
	 * Description
	 */
	description = 10,
	/**
	 * URL Vendor
	 */
	urlVendor = 11,
	/**
	 * URL Designer
	 */
	urlDesigner = 12,
	/**
	 * License Description
	 */
	licenseDescription = 13,
	/**
	 * License Info URL
	 */
	licenseInfoURL = 14,
	/**
	 * Typographic Family name
	 */
	typographicFamilyName = 16,
	/**
	 * Typographic Subfamily name
	 */
	typographicSubfamilyName = 17,
	/**
	 * Compatible Full
	 */
	compatibleFull = 18,
	/**
	 * Sample text
	 */
	sampleText = 19,
	/**
	 * PostScript CID findfont name
	 */
	postScriptCID = 20,
	/**
	 * WWS Family Name
	 */
	wwsFamilyName = 21,
	/**
	 * WWS Subfamily Name
	 */
	wwsSubfamilyName = 22,
	/**
	 * Light Background Palette
	 */
	lightBackgroundPalette = 23,
	/**
	 * Dark Background Palette
	 */
	darkBackgroundPalette = 24,
	/**
	 * Variations PostScript Name Prefix
	 */
	postScriptNamePrefix = 25,
}

export interface NameRecordFilter {
	platformID?: number;
	platformSpecificID?: number;
	languageID?: number;
}

export interface NAMERecord {
	platformID: number;
	platformSpecificID: number;
	languageID: number;
	nameID: NameIDs;
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

export class NAME extends FontTable {
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

	public getNameRecord(id: NameIDs, filter: NameRecordFilter = {}): NAMERecord | null {
		for (const item of this.nameRecords) {
			if (id !== item.nameID
				|| (filter.platformID !== undefined && item.platformID !== filter.platformID)
				|| (filter.platformSpecificID !== undefined && item.platformSpecificID !== filter.platformSpecificID)
				|| (filter.languageID !== undefined && item.languageID !== filter.languageID)) {
				continue;
			}

			return item;
		}

		return null;
	}

	public getName(id: NameIDs, filter: NameRecordFilter = {}): string | null {
		const record = this.getNameRecord(id, filter);

		if (record) {
			let encoding: TextEncoding = "ascii";
			if (record.platformID === 0
				|| (record.platformID === 3 && (record.platformSpecificID === 1 || record.platformSpecificID === 10))) {
				encoding = "utf16be";
			}

			return Convert.ToUtf8String(new Uint8Array(record.value), encoding);
		}

		return null;
	}

}

