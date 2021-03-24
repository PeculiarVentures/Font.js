import { SeqStream } from "bytestreamjs";
import { FontTable } from "../../Table";
import { KERNFormat } from "./Format";
import { KERNFormat0 } from "./Format0";
import { KERNFormat2 } from "./Format2";

export interface KERNTableCoverageV0 {
	horizontal: number;
	minimum: number;
	crossStream: number;
	override: number;
	format: number;
}

export interface KERNTableV0 {
	version: number;
	length: number;
	coverage: KERNTableCoverageV0;
	value?: KERNFormat;
}

export interface KERNTableCoverageV1 {
	kernVertical: number;
	kernCrossStream: number;
	kernVariation: number;
	format: number;
}

export interface KERNTableV1 {
	table: KERNFormat2;
	length: number;
	tupleIndex: number;
	coverage: KERNTableCoverageV1;
	value: KERNFormat;

}

export type KERNTableType = KERNTableV0 | KERNTableV1;

export interface KERNParameters {
	version?: number;
	tables?: KERNTableType[];
}

export class KERN extends FontTable {

	public version: number;
	public tables: KERNTableType[];

	constructor(parameters: KERNParameters = {}) {
		super();

		this.version = parameters.version || 0x0000;
		this.tables = parameters.tables || [];
	}

	public static get tag() {
		return 0x6B65726E;
	}

	public toStream(stream: SeqStream) {
		switch (this.version) {
			case 0:
				{
					stream.appendUint16(this.version);
					stream.appendUint16(this.tables.length);

					for (const table of this.tables) {
						const tableStream = new SeqStream();
						// TODO Remove lint comment
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						table.value!.toStream(tableStream, 6);

						// TODO Remove lint and ts comment
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						//@ts-ignore
						stream.appendUint16(table.version);
						stream.appendUint16(tableStream.length + 6);

						let coverage = 0;

						if ("horizontal" in table.coverage && table.coverage.horizontal) {
							coverage |= 0x0001;
						}
						if ("minimum" in table.coverage && table.coverage.minimum) {
							coverage |= 0x0002;
						}
						if ("crossStream" in table.coverage && table.coverage.crossStream) {
							coverage |= 0x0004;
						}
						if ("override" in table.coverage && table.coverage.override) {
							coverage |= 0x0008;
						}

						coverage |= (table.coverage.format << 8);

						stream.appendUint16(coverage);
						stream.append(tableStream.stream);
					}
				}
				break;
			case 0x000010000:
				{
					stream.appendUint32(this.version);
					stream.appendUint32(this.tables.length);

					for (const table of this.tables) {
						const tableStream = new SeqStream();
						// TODO Remove lint comment
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						table.value!.toStream(tableStream, 8);

						stream.appendUint32(tableStream.length + 8);

						let coverage = 0;

						if ("kernVertical" in table.coverage && table.coverage.kernVertical) {
							coverage |= 0x8000;
						}
						if ("kernCrossStream" in table.coverage && table.coverage.kernCrossStream) {
							coverage |= 0x4000;
						}
						if ("kernVariation" in table.coverage && table.coverage.kernVariation) {
							coverage |= 0x2000;
						}

						coverage |= table.coverage.format;

						stream.appendUint16(coverage);
						// TODO Remove lint and ts comment
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						stream.appendUint16(table.tupleIndex);

						stream.append(tableStream.stream);
					}
				}
				break;
			default:
		}

		return true;
	}

	static fromStream(stream: SeqStream): KERN {
		const parameters: KERNParameters = {};

		parameters.version = stream.getUint16();
		parameters.tables = [];

		switch (parameters.version) {
			case 0:
				{
					const nTables = stream.getUint16();

					for (let i = 0; i < nTables; i++) {
						const table: KERNTableV0 = {
							version: stream.getUint16(),
							length: stream.getUint16(),
						} as KERNTableV0;

						const coverage = stream.getUint16();

						table.coverage = {
							horizontal: coverage & 0x0001,
							minimum: (coverage & 0x0002) >> 1,
							crossStream: (coverage & 0x0004) >> 2,
							override: (coverage & 0x0008) >> 3,
							format: (coverage & 0xFF00) >> 8,
						};

						switch (table.coverage.format) {
							case 0:
								table.value = KERNFormat0.fromStream(stream);
								break;
							case 2:
								table.value = KERNFormat2.fromStream(stream, 6, table.length);
								break;
							default:
						}

						parameters.tables.push(table);
					}
				}

				break;
			case 1:
				{
					stream.resetPosition();

					parameters.version = stream.getUint32(); // TODO Version reassignment?
					const nTables = stream.getUint32();

					for (let i = 0; i < nTables; i++) {
						const table = {} as KERNTableV1;
						table.length = stream.getUint32();

						const coverage = stream.getUint16();

						table.tupleIndex = stream.getUint16();
						table.coverage = {
							kernVertical: coverage & 0x8000,
							kernCrossStream: coverage & 0x4000,
							kernVariation: coverage & 0x2000,
							format: coverage & 0x00FF,
						};

						switch (table.coverage.format) {
							case 0:
								table.value = KERNFormat0.fromStream(stream);
								break;
							case 2:
								table.value = KERNFormat2.fromStream(stream, 8, table.length);
								break;
							default:
						}

						parameters.tables.push(table);
					}
				}
				break;
			default:
		}


		return new KERN(parameters);
	}

	/**
	 * Find kerning value for pair of glyph indexes
	 * @param leftIndex Index of glyph from left side
	 * @param rightIndex Index of glyph from right side
	 * @param table Index of kerning table to find kerning value
	 */
	find(leftIndex: number, rightIndex: number, table = 0): number {
		if (this.tables.length < (table + 1)) {
			return 0;
		}

		// TODO Remove lint comment.
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const result = this.tables[table].value!.map.get(`${leftIndex}-${rightIndex}`);
		if (result === undefined) {
			return 0;
		}

		return result;
	}

	/**
	 * Find kerning values for array of glyph indexes
	 * @param array Array of glyph indexes
	 * @param table Index of kerning table to find kerning value
	 */
	public findForArray(array: number[], table = 0): number[] {
		if (this.tables.length < (table + 1)) {
			return Array.from(array, () => 0);
		}

		const result: number[] = [];

		for (let i = 0; i < (array.length - 1); i++) {
			const left = array[i];
			const right = array[i + 1];

			result.push(this.find(left, right, table));
		}

		return result;
	}

}
