import { SeqStream } from "bytestreamjs";
import { FontTable } from "../Table";

export interface PREPParameters {
	values?: Uint8Array;
}
export class PREP extends FontTable {

	public values: Uint8Array;

	constructor(parameters: PREPParameters = {}) {
		super();

		this.values = parameters.values || new Uint8Array();
	}

	public static get tag() {
		return 0x70726570;
	}

	public toStream(stream: SeqStream): boolean {
		stream.appendView(new Uint8Array(this.values));

		return true;
	}

	public static fromStream(stream: SeqStream): PREP {
		const parameters: PREPParameters = {};

		parameters.values = stream.getBlock(stream.length);

		return new PREP(parameters);
	}

}

