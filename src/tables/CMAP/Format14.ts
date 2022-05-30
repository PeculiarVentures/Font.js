import { SeqStream } from "bytestreamjs";
import { CMAPSubTable, CMAPSubTableParameters, GlyphMap } from "./CMAPSubTable";


export interface DefaultUVSRecords {
	startUnicodeValue: number;
	additionalCount: number;
}

export interface NonDefaultUVSRecords {
	unicodeValue: number;
	glyphID: number;
}

export interface VarSelectorRecord {
	varSelector: number;
	defaultUVSOffset: number;
	nonDefaultUVSOffset: number;
	defaultUVSRecords?: DefaultUVSRecords[];
	nonDefaultUVSRecords?: NonDefaultUVSRecords[];
}

export interface Format14Parameters extends CMAPSubTableParameters {
	varSelectorRecords?: VarSelectorRecord[];
}

export class Format14 extends CMAPSubTable {
	protected onGetGlyphMap(): GlyphMap {
		throw new Error("Method not implemented.");
	}

	/**
	 * Format number is set to 14
	 */
	public get format(): 14 {
		return 14;
	}

	public varSelectorRecords: VarSelectorRecord[];

	constructor(parameters: Format14Parameters = {}) {
		super(parameters);

		this.varSelectorRecords = parameters.varSelectorRecords || [];
	}

	static get className() {
		return "Format14";
	}

	public static fromStream(stream: SeqStream): Format14 {
		//#region Read major information
		stream.getUint32(); // length
		const numVarSelectorRecords = stream.getUint32();
		//#endregion
		//#region Read "varSelectorRecords" array
		const varSelectorRecords: VarSelectorRecord[] = [];

		for (let i = 0; i < numVarSelectorRecords; i++) {
			//#region Read header
			const varSelectorRecord: VarSelectorRecord = {
				varSelector: stream.getUint24(),
				defaultUVSOffset: stream.getUint32(),
				nonDefaultUVSOffset: stream.getUint32(),
			};
			//#endregion
			//#region Read "default UVS"
			if (varSelectorRecord.defaultUVSOffset) {
				varSelectorRecord.defaultUVSRecords = [];

				const defaultUVSStream = new SeqStream({ stream: stream.stream.slice(varSelectorRecord.defaultUVSOffset) });

				const numUnicodeValueRanges = defaultUVSStream.getUint32();

				for (let j = 0; j < numUnicodeValueRanges; j++) {
					const defaultUVS = {
						startUnicodeValue: defaultUVSStream.getUint24(),
						additionalCount: (defaultUVSStream.getBlock(1))[0],
					};

					varSelectorRecord.defaultUVSRecords.push(defaultUVS);
				}
			}
			//#endregion
			//#region Read "non-default UVS"
			if (varSelectorRecord.nonDefaultUVSOffset) {
				varSelectorRecord.nonDefaultUVSRecords = [];

				const nonDefaultUVSStream = new SeqStream({ stream: stream.stream.slice(varSelectorRecord.nonDefaultUVSOffset) });

				const numUVSMappings = nonDefaultUVSStream.getUint32();

				for (let j = 0; j < numUVSMappings; j++) {
					const uvsMapping = {
						unicodeValue: nonDefaultUVSStream.getUint24(),
						glyphID: nonDefaultUVSStream.getUint16(),
					};

					varSelectorRecord.nonDefaultUVSRecords.push(uvsMapping);
				}
			}
			//#endregion
			varSelectorRecords.push(varSelectorRecord);
		}
		//#endregion

		return new Format14({
			varSelectorRecords
		});
	}

}
