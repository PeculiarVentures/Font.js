import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass";

export interface CVTParameters {
	values?: number[];
}

export class CVT extends BaseClass {

	public values: number[];

	constructor(parameters: CVTParameters = {}) {
		super();

		this.values = parameters.values || [];
	}

	static get tag() {
		return 0x63767420;
	}

	public toStream(stream: SeqStream) {
		for (const value of this.values)
			stream.appendInt16(value);

		return true;
	}

	public static fromStream(stream: SeqStream) {
		const parameters: CVTParameters = {};
		parameters.values = [];

		while (stream.length) {
			const value = stream.getInt16();
			parameters.values.push(value);
		}

		return new CVT(parameters);
	}

}

