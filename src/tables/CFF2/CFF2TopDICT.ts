import { DICTParameters, DICT } from "../CFF";

export interface CFF2TopDICTParameters extends DICTParameters {
	FontMatrix?: number[];
	CharStrings?: number;
	FDArray?: number;
	FDSelect?: number;
	vstore?: number;
}

export class CFF2TopDICT extends DICT {

	public FontMatrix: number[];
	public CharStrings?: number;
	public FDArray?: number;
	public FDSelect?: number;
	public vstore?: number;

	constructor(parameters: CFF2TopDICTParameters = {}) {
		super(parameters);

		this.FontMatrix = parameters.FontMatrix || [0.001, 0, 0, 0.001, 0, 0];

		if ("CharStrings" in parameters)
			this.CharStrings = parameters.CharStrings;
		if ("FDArray" in parameters)
			this.FDArray = parameters.FDArray;
		if ("FDSelect" in parameters)
			this.FDSelect = parameters.FDSelect;
		if ("vstore" in parameters)
			this.vstore = parameters.vstore;
	}

	static fromBuffer(buffer: ArrayBuffer) {
		const dict = DICT.fromBuffer(buffer);

		const parameters: CFF2TopDICTParameters = { entries: dict.entries };

		for (const entry of dict.entries) {
			switch (entry.key) {
				case 1207:
					parameters.FontMatrix = entry.values;
					break;
				case 17:
					parameters.CharStrings = entry.values[0];
					break;
				case 1236:
					parameters.FDArray = entry.values[0];
					break;
				case 1237:
					parameters.FDSelect = entry.values[0];
					break;
				case 24:
					parameters.vstore = entry.values[0];
					break;
				default:
			}
		}

		return new CFF2TopDICT(parameters);
	}

}
