import { SeqStream } from "bytestreamjs";
import { BaseClass } from "./BaseClass";
import { Font } from "./Font";

export interface FontCollectionParameters {
	ttcTag?: number;
	majorVersion?: number;
	minorVersion?: number;
	fonts?: Font[];
	dsigTag?: number;
	dsigLength?: number;
	dsigOffset?: number;
}

export class FontCollection extends BaseClass {

	public ttcTag: number;
	public majorVersion: number;
	public minorVersion: number;
	public fonts: Font[];
	public dsigTag?: number;
	public dsigLength?: number;
	public dsigOffset?: number;

	constructor(parameters: FontCollectionParameters = {}) {
		super();

		this.ttcTag = parameters.ttcTag || 0x74746366;
		this.majorVersion = parameters.majorVersion || 0;
		this.minorVersion = parameters.minorVersion || 0;
		this.fonts = parameters.fonts || [];

		if ("dsigTag" in parameters) { // TODO Move to dsig field
			this.dsigTag = parameters.dsigTag || 0x44534947;
			this.dsigLength = parameters.dsigLength || 0;
			this.dsigOffset = parameters.dsigOffset || 0;
		}
	}

	public toStream(stream: SeqStream): boolean {
		//#region Initial variables
		const offsets: number[] = [];
		const fontStream = new SeqStream();

		let constOffset = 12 + this.fonts.length * 4;
		if (this.majorVersion === 2) {
			constOffset += 12;
		}
		//#endregion

		//#region Fill stream with all values for fonts
		for (const font of this.fonts) {
			offsets.push(fontStream.start);
			font.toStream(fontStream, fontStream.start + constOffset);
		}
		//#endregion

		//#region Put font collection header values
		stream.appendUint32(this.ttcTag);
		stream.appendUint16(this.majorVersion);
		stream.appendUint16(this.minorVersion);
		//#endregion

		//#region Put information about font offsets
		stream.appendUint32(this.fonts.length);

		for (const offset of offsets) {
			stream.appendUint32(offset + constOffset);
		}
		//#endregion

		//#region Put additional information about DSIG table if needed
		if (this.majorVersion === 2) {
			stream.appendUint32(this.dsigTag!);
			stream.appendUint32(this.dsigLength!);
			stream.appendUint32(this.dsigOffset!);
		}
		//#endregion

		//#region Append stream with all font data
		stream.append(fontStream.stream);
		//#endregion

		return true;
	}

	public static fromStream(stream: SeqStream) {
		const result: FontCollectionParameters = {};

		result.fonts = [];

		result.ttcTag = stream.getUint32();
		result.majorVersion = stream.getUint16();
		result.minorVersion = stream.getUint16();

		const numFonts = stream.getUint32();
		const offsetTable = [];

		for (let i = 0; i < numFonts; i++) {
			const offset = stream.getUint32();
			offsetTable.push(offset);
		}

		if (result.majorVersion === 2) {
			result.dsigTag = stream.getUint32();
			result.dsigLength = stream.getUint32();
			result.dsigOffset = stream.getUint32();
		}

		for (const offset of offsetTable) {
			stream.start = offset;
			result.fonts.push(Font.fromStream(stream));
		}

		return new FontCollection(result);
	}

}
