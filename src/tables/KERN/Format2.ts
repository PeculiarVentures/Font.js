import { SeqStream } from "bytestreamjs";
import { KERNFormat, KERNFormatParameters } from "./Format";
import { TwoD } from "./TwoD";

export interface KERNTable {
	firstGlyph: number;
	nGlyphs: number;
	offsets: number[];
}

export interface KERNFormat2Parameters extends KERNFormatParameters {
	rowWidth?: number;
	leftOffsetTable?: number;
	rightOffsetTable?: number;
	array?: number;
	leftTable?: KERNTable;
	rightTable?: KERNTable;
}

export class KERNFormat2 extends KERNFormat {

	public rowWidth: number;
	public leftOffsetTable: number;
	public rightOffsetTable: number;
	public array: number;
	public leftTable?: KERNTable;
	public rightTable?: KERNTable;

	constructor(parameters: KERNFormat2Parameters = {}) {
		super(parameters);

		this.rowWidth = parameters.rowWidth || 0;
		this.leftOffsetTable = parameters.leftOffsetTable || 0;
		this.rightOffsetTable = parameters.rightOffsetTable || 0;
		this.array = parameters.array || 0;

		this.leftTable = parameters.leftTable;
		this.rightTable = parameters.rightTable;
	}

	public static get format() {
		return 2;
	}

	/**
	 * Convert current object to SeqStream data
	 * @param stream
	 * @param tableStart
	 */
	public toStream(stream: SeqStream, tableStart: number): boolean {
		//#region Initial variables
		const rows = new Map<number, Array<{ right: number; value: number; }>>();
		const columns = new Map<number, number>();

		let rowMin: null | number = null;
		let rowMax: null | number = null;

		let columnMin: null | number = null;
		let columnMax: null | number = null;

		let count = 0;
		//#endregion

		//#region Make an initial 2D array from the kerning map
		for (const [key, value] of this.map.entries()) {
			const pair = /(\d+)-(\d+)/g.exec(key);
			if (!pair || pair.length !== 3) {
				throw new Error("Incorrectly formatted map for KERN - format 0");
			}

			const left = parseInt(pair[1], 10);
			const right = parseInt(pair[2], 10);

			rowMin = (rowMin === null) ? left : Math.min(rowMin, left);
			rowMax = (rowMax === null) ? left : Math.max(rowMax, left);

			columnMin = (columnMin === null) ? right : Math.min(columnMin, right);
			columnMax = (columnMax === null) ? left : Math.max(columnMax, right);

			let row = rows.get(left);
			if (!row) {
				row = [];
			}

			row.push({
				right,
				value
			});

			if (columns.has(right) === false) {
				columns.set(right, count);
				count++;
			}

			rows.set(left, row);
		}

		rowMin = rowMin || 0;
		rowMax = rowMax || 0;
		columnMin = columnMin || 0;
		columnMax = columnMax || 0;

		//#region Transform rows and columns
		const transformedRows: number[][] = [];

		for (const key of rows.keys()) {
			transformedRows.push([key]);
		}

		const transformedColumns: number[][] = [];

		for (const key of columns.keys()) {
			transformedColumns.push([key]);
		}
		//#endregion
		const array: number[][] = [];

		for (const value of rows.values()) {
			const arrayValue = new Array<number>(columns.size);
			arrayValue.fill(0);

			for (const element of value) {
				// TODO Remove lint comment
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				arrayValue[columns.get(element.right)!] = element.value;
			}

			array.push(arrayValue);
		}
		//#endregion

		//#region Optimize array by collapsing same rows and columns
		const twoDimensionArray = new TwoD({ array });

		let changed = false;

		do {
			changed = false;

			//#region Inspect rows
			for (let i = 0; i < twoDimensionArray.rows; i++) {
				const rowArray = transformedRows[i];

				for (let j = (i + 1); j < twoDimensionArray.rows;) {
					if (twoDimensionArray.row(i).join(",") === twoDimensionArray.row(j).join(",")) {
						twoDimensionArray.deleteRow(j);

						rowArray.push(...transformedRows[j]);
						transformedRows.splice(j, 1);

						changed = true;
					} else {
						j++;
					}
				}

				transformedRows[i] = rowArray;
			}
			//#endregion

			//#region Inspect columns
			for (let i = 0; i < twoDimensionArray.columns; i++) {
				const columnArray = transformedColumns[i];

				for (let j = (i + 1); j < twoDimensionArray.columns;) {
					if (twoDimensionArray.column(i).join(",") === twoDimensionArray.column(j).join(",")) {
						twoDimensionArray.deleteColumn(j);

						columnArray.push(...transformedColumns[j]);
						transformedColumns.splice(j, 1);

						changed = true;
					} else {
						j++;
					}
				}

				transformedColumns[i] = columnArray;
			}
			//#endregion
		} while (changed);
		//#endregion

		//#region Make final array with kerning values
		const finalColumns = twoDimensionArray.columns + 1;

		const kerningArrayLength = (twoDimensionArray.rows + 1) * finalColumns * 2;

		const kerningBuffer = new ArrayBuffer(kerningArrayLength);
		const dataView = new DataView(kerningBuffer);

		const constOffset = finalColumns + 1;

		for (let i = 0; i < twoDimensionArray.rows; i++) {
			const row = twoDimensionArray.row(i);

			for (let j = 0; j < row.length; j++) {
				dataView.setInt16((constOffset + j + i * finalColumns) * 2, row[j]);
			}
		}
		//#endregion

		//#region Store "Format 2" header values
		const leftOffsetTableLength = (rowMax - rowMin + 1) * 2 + 4;

		const arrayStart = tableStart + 8;

		stream.appendUint16(finalColumns * 2); // rowWidth
		stream.appendUint16(arrayStart + kerningArrayLength); // leftOffsetTable
		stream.appendUint16(arrayStart + kerningArrayLength + leftOffsetTableLength); // rightOffsetTable
		stream.appendUint16(arrayStart); // array
		//#endregion

		//#region Append "array" value
		stream.appendView(new Uint8Array(kerningBuffer));
		//#endregion

		//#region Append "leftOffsetTable"

		//#region Append header
		stream.appendUint16(rowMin); // firstGlyph
		stream.appendUint16(rowMax - rowMin + 1); // nGlyphs
		//#endregion

		//#region Set default offset for all possible glyphs
		const leftOffsetsTableMapArray: [number, number][] = [];

		for (let i = rowMin; i <= rowMax; i++) {
			leftOffsetsTableMapArray.push([i, arrayStart]);
		}
		//#endregion

		//#region Fill map with real kerning values
		const leftOffsetsTableMap = new Map(leftOffsetsTableMapArray);

		for (let i = 0; i < transformedRows.length; i++) {
			const rowArray = transformedRows[i];

			for (const element of rowArray)
				leftOffsetsTableMap.set(element, 2 * (i + 1) * finalColumns + arrayStart);
		}
		//#endregion

		//#region Store final values into the stream
		for (const value of leftOffsetsTableMap.values()) {
			stream.appendUint16(value);
		}
		//#endregion
		//#endregion

		//#region Append "rightOffsetTable"

		//#region Append header
		stream.appendUint16(columnMin); // firstGlyph
		stream.appendUint16(columnMax - columnMin + 1); // nGlyphs
		//#endregion

		//#region Set default offset for all possible glyphs
		const rightOffsetsTableMapArray: [number, number][] = [];

		for (let i = columnMin; i <= columnMax; i++) {
			rightOffsetsTableMapArray.push([i, 0]);
		}
		//#endregion

		//#region Fill map with real kerning values
		const rightOffsetsTableMap = new Map(rightOffsetsTableMapArray);

		for (let i = 0; i < transformedColumns.length; i++) {
			const columnArray = transformedColumns[i];

			for (const element of columnArray) {
				rightOffsetsTableMap.set(element, (i + 1) * 2);
			}
		}
		//#endregion

		//#region Store final values into the stream
		for (const value of rightOffsetsTableMap.values()) {
			stream.appendUint16(value);
		}
		//#endregion
		//#endregion

		return true;
	}

	/**
	 * Convert SeqStream data to object
	 * @param stream
	 * @param tableStart
	 * @param tableLength
	 */
	static fromStream(stream: SeqStream, tableStart: number, tableLength: number): KERNFormat2 {
		const parameters: KERNFormat2Parameters = {};

		//#region Initialize "DataView"
		const start = stream.start - tableStart;
		const tableStream = new SeqStream({ stream: stream.stream.slice(start, start + tableLength) });
		const view = new DataView(tableStream.stream.buffer);
		//#endregion

		//#region Read "simple header" values
		parameters.rowWidth = view.getUint16(tableStart);
		parameters.leftOffsetTable = view.getUint16(tableStart + 2);
		parameters.rightOffsetTable = view.getUint16(tableStart + 4);
		parameters.array = view.getUint16(tableStart + 6);
		//#endregion

		//#region Read "left-hand" offsets
		parameters.leftTable = {
			firstGlyph: view.getUint16(parameters.leftOffsetTable),
			nGlyphs: view.getUint16(parameters.leftOffsetTable + 2),
			offsets: [],
		};


		let constOffset = parameters.leftOffsetTable + 4;

		for (let i = 0; i < parameters.leftTable.nGlyphs; i++) {
			const offset = view.getUint16(constOffset + i * 2);
			parameters.leftTable.offsets.push(offset);
		}
		//#endregion
		//#region Read "right-hand" offsets
		parameters.rightTable = {
			firstGlyph: view.getUint16(parameters.rightOffsetTable),
			nGlyphs: view.getUint16(parameters.rightOffsetTable + 2),
			offsets: []
		};


		constOffset = parameters.rightOffsetTable + 4;

		for (let i = 0; i < parameters.rightTable.nGlyphs; i++) {
			const offset = view.getUint16(constOffset + i * 2);
			parameters.rightTable.offsets.push(offset);
		}
		//#endregion
		//#region Produce final kerning map
		parameters.map = new Map();

		for (let i = 0; i < parameters.leftTable.nGlyphs; i++) {
			for (let j = 0; j < parameters.rightTable.nGlyphs; j++) {
				const value = view.getInt16(parameters.leftTable.offsets[i] + parameters.rightTable.offsets[j]);
				if (value) {
					parameters.map.set(`${i + parameters.leftTable.firstGlyph}-${j + parameters.rightTable.firstGlyph}`, value);
				}
			}
		}
		//#endregion

		return new KERNFormat2(parameters);
	}

}
