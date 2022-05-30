import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../../BaseClass";

export interface CFFEncodingParameters {
	format?: number;
	encoding?: Record<number, number>;
}

export class CFFEncoding extends BaseClass {
	public format: number;
	public encoding: Record<number, number>;

	constructor(parameters: CFFEncodingParameters = {}) {
		super();

		this.format = parameters.format || 0;
		this.encoding = parameters.encoding || {};
	}

	/**
	 * Convert SeqStream data to object
	 * @param stream
	 */
	static fromStream(stream: SeqStream) {
		const parameters: CFFEncodingParameters = {};

		parameters.encoding = {};

		parameters.format = (stream.getBlock(1))[0];

		switch (parameters.format) {
			case 0:
				{
					const nCodes = (stream.getBlock(1))[0];

					for (let i = 0; i < nCodes; i++) {
						const code = (stream.getBlock(1))[0];
						parameters.encoding[code] = i;
					}
				}

				break;
			case 1:
				{
					const nRanges = (stream.getBlock(1))[0];

					for (let i = 0; i < nRanges; i++) {
						const first = (stream.getBlock(1))[0];
						const nLeft = (stream.getBlock(1))[0];

						for (let j = first, code = 1; j <= (first + nLeft); j++, code++)
							parameters.encoding[j] = code;
					}
				}

				break;
			default:
		}

		return new CFFEncoding(parameters);
	}

}
