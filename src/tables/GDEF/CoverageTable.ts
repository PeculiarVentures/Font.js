import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../../BaseClass";


export interface RangeRecord {
	startGlyphID: number;
	endGlyphID: number;
	startCoverageIndex: number;
}

export interface CoverageTableParameters {
	glyphCount?: number;
	glyphArray?: number[];
	rangeCount?: number;
	rangeRecords?: RangeRecord[];
	coverageFormat?: number;
}

export class CoverageTable extends BaseClass {

	public constructor(parameters: CoverageTableParameters = {}) {
		super();
	}

	static fromStream(stream: SeqStream) {
		const parameters: CoverageTableParameters = {};

		parameters.coverageFormat = stream.getUint16();

		switch (parameters.coverageFormat) {
			case 1:
				{
					parameters.glyphCount = stream.getUint16();
					parameters.glyphArray = [];

					for (let i = 0; i < parameters.glyphCount; i++) {
						const glyph = stream.getUint16();
						parameters.glyphArray.push(glyph);
					}
				}

				break;
			case 2:
				{
					parameters.rangeCount = stream.getUint16();
					parameters.rangeRecords = [];

					for (let i = 0; i < parameters.rangeCount; i++) {
						const rangeRecord = {
							startGlyphID: stream.getUint16(),
							endGlyphID: stream.getUint16(),
							startCoverageIndex: stream.getUint16(),
						};

						parameters.rangeRecords.push(rangeRecord);
					}
				}

				break;
			default:
				return new CoverageTable();
		}

		return new CoverageTable(parameters);
	}

}
