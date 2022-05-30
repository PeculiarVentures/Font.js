import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../../BaseClass";
import { CoverageTable } from "./CoverageTable";

export interface AttachPoint {
	pointIndices: number[];
	pointCount: number;
}

export interface AttachListTableParameters {
	coverageTable?: CoverageTable;
	attachPoints?: AttachPoint[];
}

export class AttachListTable extends BaseClass {

	public coverageTable: CoverageTable;
	public attachPoints: AttachPoint[];

	constructor(parameters: AttachListTableParameters = {}) {
		super();

		this.coverageTable = parameters.coverageTable || new CoverageTable();
		this.attachPoints = parameters.attachPoints || [];
	}

	static fromStream(stream: SeqStream) {
		const parameters: AttachListTableParameters = {};
		parameters.attachPoints = [];

		const coverageOffset = stream.getUint16();
		if (coverageOffset) {
			parameters.coverageTable = CoverageTable.fromStream(new SeqStream({ stream: stream.stream.slice(coverageOffset) }));
		}

		const glyphCount = stream.getUint16();

		for (let i = 0; i < glyphCount; i++) {
			const attachPointOffset = stream.getUint16();
			const attachPointStream = new SeqStream({ stream: stream.stream.slice(attachPointOffset) });

			const attachPoint: AttachPoint = {
				pointIndices: [],
				pointCount: attachPointStream.getUint16(),
			};

			for (let j = 0; j < attachPoint.pointCount; j++) {
				const pointIndex = attachPointStream.getUint16();
				attachPoint.pointIndices.push(pointIndex);
			}

			parameters.attachPoints.push(attachPoint);
		}

		return new AttachListTable(parameters);
	}

}
