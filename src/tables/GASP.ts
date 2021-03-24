import { SeqStream } from "bytestreamjs";
import { FontTable } from "../Table";

export enum RangeGaspBehaviorFlags {

	/**
	 * Use gridfitting
	 */
	GASP_GRIDFIT = 0x0001,

	/**
	 * Use grayscale rendering
	 */
	GASP_DOGRAY = 0x0002,

	/**
	 * Use gridfitting with ClearType symmetric smoothing. Only supported in version 1 'gasp'
	 */
	GASP_SYMMETRIC_GRIDFIT = 0x0004,

	/**
	 * Use smoothing along multiple axes with ClearType. Only supported in version 1 'gasp'
	 */
	GASP_SYMMETRIC_SMOOTHING = 0x0008,

}

export interface GASPRange {
	rangeMaxPPEM: number;
	rangeGaspBehavior: number;
}

export interface GASPParameters {
	version?: number;
	gaspRanges?: GASPRange[];
}

export class GASP extends FontTable {

	public version: number;
	public gaspRanges: GASPRange[];

	constructor(parameters: GASPParameters = {}) {
		super();

		this.version = parameters.version || 0x0001;
		this.gaspRanges = parameters.gaspRanges || [];
	}

	public static get tag() {
		return 0x67617370;
	}

	public toStream(stream: SeqStream) {
		stream.appendUint16(this.version);
		stream.appendUint16(this.gaspRanges.length);

		for (const range of this.gaspRanges) {
			stream.appendUint16(range.rangeMaxPPEM);
			stream.appendUint16(range.rangeGaspBehavior);
		}

		return true;
	}

	static fromStream(stream: SeqStream) {
		const version = stream.getUint16();
		const numRanges = stream.getUint16();
		const gaspRanges: GASPRange[] = [];

		for (let i = 0; i < numRanges; i++) {
			const gaspRange = {
				rangeMaxPPEM: stream.getUint16(),
				rangeGaspBehavior: stream.getUint16(),
			};

			gaspRanges.push(gaspRange);
		}

		return new GASP({
			version,
			gaspRanges
		});
	}

}

