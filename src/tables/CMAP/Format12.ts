import { SeqStream } from "bytestreamjs";
import { CMAPSubTable, CMAPSubTableParameters } from "./CMAPSubTable";

export interface Format12Parameters extends CMAPSubTableParameters {
	language?: number;
	groups?: number[];
	codeToGID?: Map<number, number[]>;
	gidToCode?: Map<number, number[]>;
}

export class Format12 extends CMAPSubTable {

	public language: number;
	public groups: number[];
	public codeToGID: Map<number, number>;
	public gidToCode: Map<number, number[]>;

	constructor(parameters: Format12Parameters = {}) {
		super(parameters);

		this.language = parameters.language || 0;
		this.groups = parameters.groups || [];

		this.codeToGID = parameters.codeToGID || new Map();
		this.gidToCode = parameters.gidToCode || new Map();
	}

	static get className() {
		return "Format12";
	}

	public static fromStream(stream: SeqStream) {
		//#region Initial variables
		const codeToGID = new Map<number, number[]>();
		const gidToCode = new Map<number, number[]>();
		//#endregion
		//#region Read major information
		stream.getUint16(); // reserved
		stream.getUint32(); // length
		const language = stream.getUint32();
		const numGroups = stream.getUint32();
		//#endregion
		//#region Read information about groups
		for (let i = 0; i < numGroups; i++) {
			const startCharCode = stream.getUint32();
			const endCharCode = stream.getUint32();
			let startGlyphID = stream.getUint32();

			for (let j = startCharCode; j <= endCharCode; j++, startGlyphID++) {
				const code = gidToCode.get(startGlyphID) || [];
				code.push(j);

				gidToCode.set(startGlyphID, code);

				const glyph = codeToGID.get(j) || [];
				glyph.push(startGlyphID);

				codeToGID.set(j, glyph);
			}
		}
		//#endregion
		return new Format12({
			language,
			gidToCode,
			codeToGID
		});
	}

	public gid(code: number): number {
		return (this.codeToGID.get(code) || 0);
	}

	public code(gid: number) {
		return (this.gidToCode.get(gid) || []);
	}

}
