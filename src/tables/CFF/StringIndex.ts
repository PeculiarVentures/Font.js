import { SeqStream } from "bytestreamjs";
import { INDEXParameters, INDEX } from "./IDX";

export interface StringIndexParameters extends INDEXParameters<string> {
}

export class StringIndex extends INDEX<string> {

	constructor(params: StringIndexParameters = {}) {
		super(params);
	}

	static fromStream(stream: SeqStream, version = 1): StringIndex {
		const index = INDEX.fromStream(stream, version);

		const data = index.data.map(o => String.fromCharCode(...new Uint8Array(o)));

		return new StringIndex({ data });
	}

}
