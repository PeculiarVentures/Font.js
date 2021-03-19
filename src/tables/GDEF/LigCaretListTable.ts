import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../../BaseClass";
import { AttachListTable } from "./AttachListTable";
import { ClassDefTable } from "./ClassDefTable";


export interface LigCaretListTableParameters {
	coverageOffset?: number;
	ligGlyphCount?: number;
	ligGlyphOffsets?: number[];
}

export class LigCaretListTable extends BaseClass {

	public constructor(parameters: LigCaretListTableParameters = {}) {
		super();
	}

	static fromStream(stream: SeqStream) {
		const parameters: LigCaretListTableParameters = {};

		parameters.coverageOffset = stream.getUint16();
		parameters.ligGlyphCount = stream.getUint16();
		parameters.ligGlyphOffsets = [];

		for (let i = 0; i < parameters.ligGlyphCount; i++) {
			const ligGlyphOffset = stream.getUint16();
			parameters.ligGlyphOffsets.push(ligGlyphOffset);
		}

		return new LigCaretListTable(parameters);
	}

}

export interface GDEFParameters {
	majorVersion?: number;
	minorVersion?: number;
	glyphClassDef?: ClassDefTable;
	attachList?: AttachListTable;
	ligCaretList?: LigCaretListTable;
	markAttachClassDefOffset?: number;
	markGlyphSetsDefOffset?: number;
	itemVarStoreOffset?: number;
}
