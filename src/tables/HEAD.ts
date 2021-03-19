import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass";
import { getLongDateTime, appendLongDateTime } from "../common.js";

export interface HEADParameters {
	version?: number;
	fontRevision?: number;
	checkSumAdjustment?: number;
	magicNumber?: number;
	flags?: number;
	unitsPerEm?: number;
	created?: Date;
	modified?: Date;
	xMin?: number;
	yMin?: number;
	xMax?: number;
	yMax?: number;
	macStyle?: number;
	lowestRecPPEM?: number;
	fontDirectionHint?: number;
	indexToLocFormat?: number;
	glyphDataFormat?: number;
}

export class HEAD extends BaseClass {

	public version: number;
	public fontRevision: number;
	public checkSumAdjustment: number;
	public magicNumber: number;
	public flags: number;
	public unitsPerEm: number;
	public created: Date;
	public modified: Date;
	public xMin: number;
	public yMin: number;
	public xMax: number;
	public yMax: number;
	public macStyle: number;
	public lowestRecPPEM: number;
	public fontDirectionHint: number;
	public indexToLocFormat: number;
	public glyphDataFormat: number;

	constructor(parameters: HEADParameters = {}) {
		super();

		this.version = parameters.version || 0x00010000;
		this.fontRevision = parameters.fontRevision || 0x00010000;
		this.checkSumAdjustment = parameters.checkSumAdjustment || 0;
		this.magicNumber = parameters.magicNumber || 0x5F0F3CF5;
		this.flags = parameters.flags || 0;
		this.unitsPerEm = parameters.unitsPerEm || 2048;
		this.created = parameters.created || new Date();
		this.modified = parameters.modified || new Date();
		this.xMin = parameters.xMin || 0;
		this.yMin = parameters.yMin || 0;
		this.xMax = parameters.xMax || 0;
		this.yMax = parameters.yMax || 0;
		this.macStyle = parameters.macStyle || 0;
		this.lowestRecPPEM = parameters.lowestRecPPEM || 9;
		this.fontDirectionHint = parameters.fontDirectionHint || 2;
		this.indexToLocFormat = parameters.indexToLocFormat || 0;
		this.glyphDataFormat = parameters.glyphDataFormat || 0;
	}

	public static get tag() {
		return 0x68656164;
	}

	public toStream(stream: SeqStream): boolean {
		stream.appendUint32(this.version);
		stream.appendUint32(this.fontRevision);

		//#region The "checkSumAdjustment" need to be calculated later in "Font.toStream"
		stream.appendUint32(0);
		//#endregion

		stream.appendUint32(this.magicNumber);
		stream.appendUint16(this.flags);
		stream.appendUint16(this.unitsPerEm);
		appendLongDateTime(this.created, stream);
		appendLongDateTime(this.modified, stream);
		stream.appendInt16(this.xMin);
		stream.appendInt16(this.yMin);
		stream.appendInt16(this.xMax);
		stream.appendInt16(this.yMax);
		stream.appendUint16(this.macStyle);
		stream.appendUint16(this.lowestRecPPEM);
		stream.appendUint16(this.fontDirectionHint);
		stream.appendUint16(this.indexToLocFormat);
		stream.appendUint16(this.glyphDataFormat);

		return true;
	}

	public static fromStream(stream: SeqStream): HEAD {
		const parameters: HEADParameters = {};

		parameters.version = stream.getUint32();
		parameters.fontRevision = stream.getUint32();
		parameters.checkSumAdjustment = stream.getUint32();
		parameters.magicNumber = stream.getUint32();
		parameters.flags = stream.getUint16();
		parameters.unitsPerEm = stream.getUint16();
		parameters.created = getLongDateTime(stream);
		parameters.modified = getLongDateTime(stream);
		parameters.xMin = stream.getInt16();
		parameters.yMin = stream.getInt16();
		parameters.xMax = stream.getInt16();
		parameters.yMax = stream.getInt16();
		parameters.macStyle = stream.getUint16();
		parameters.lowestRecPPEM = stream.getUint16();
		parameters.fontDirectionHint = stream.getInt16();
		parameters.indexToLocFormat = stream.getInt16();
		parameters.glyphDataFormat = stream.getInt16();

		return new HEAD(parameters);
	}

}
