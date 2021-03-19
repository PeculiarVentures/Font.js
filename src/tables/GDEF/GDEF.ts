import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../../BaseClass";
import { AttachListTable } from "./AttachListTable";
import { ClassDefTable } from "./ClassDefTable";
import { GDEFParameters, LigCaretListTable } from "./LigCaretListTable";

export class GDEF extends BaseClass {

	constructor(parameters: GDEFParameters = {}) {
		super();
	}

	static get tag() {
		return 0x47444546;
	}

	static fromStream(stream: SeqStream) {
		//#region Initial variables
		const parameters: GDEFParameters = {};
		//#endregion

		//#region Read a standard header information for v1.0
		parameters.majorVersion = stream.getUint16();
		parameters.minorVersion = stream.getUint16();

		const glyphClassDefOffset = stream.getUint16();
		if (glyphClassDefOffset) {
			parameters.glyphClassDef = ClassDefTable.fromStream(new SeqStream({ stream: stream.stream.slice(glyphClassDefOffset) }));
		}

		const attachListOffset = stream.getUint16();
		if (attachListOffset) {
			parameters.attachList = AttachListTable.fromStream(new SeqStream({ stream: stream.stream.slice(attachListOffset) }));
		}

		const ligCaretListOffset = stream.getUint16();
		if (ligCaretListOffset) {
			parameters.ligCaretList = LigCaretListTable.fromStream(new SeqStream({ stream: stream.stream.slice(ligCaretListOffset) }));
		}

		parameters.markAttachClassDefOffset = stream.getUint16();
		//#endregion

		//#region Read additiona data specific for each version
		switch (true) {
			case ((parameters.majorVersion === 1) && (parameters.minorVersion === 0)):
				break;
			case ((parameters.majorVersion === 1) && (parameters.minorVersion === 2)):
				parameters.markGlyphSetsDefOffset = stream.getUint16();
				break;
			case ((parameters.majorVersion === 1) && (parameters.minorVersion === 3)):
				parameters.markGlyphSetsDefOffset = stream.getUint16();
				parameters.itemVarStoreOffset = stream.getUint16();
				break;
			default:
				return new GDEF({}); // Unknown version of header
		}
		//#endregion

		return new GDEF(parameters);
	}

}

