import { SeqStream } from "bytestreamjs";
import { FontTable } from "../Table";

export interface FPGMParameters {
	values?: Uint8Array;
}

export class FPGM extends FontTable {

	public values: Uint8Array;

	constructor(parameters: FPGMParameters = {}) {
		super();

		this.values = parameters.values || new Uint8Array();
	}

	public static get tag() {
		return 0x6670676D;
	}

	public static fromStream(stream: SeqStream) {
		const parameters: FPGMParameters = {};

		parameters.values = stream.getBlock(stream.length);

		return new FPGM(parameters);
	}

}
