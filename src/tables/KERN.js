import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass.js";
//**************************************************************************************
class Format extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.map = parameters.map || new Map();
	}
	//**********************************************************************************
	static get format()
	{
		throw new Error("Incorrectly initialized format class");
	}
	//**********************************************************************************
}
//**************************************************************************************
export class Format0 extends Format
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		this.nPairs = parameters.nPairs || 0;
		this.searchRange = parameters.searchRange || 0;
		this.entrySelector = parameters.entrySelector || 0;
		this.rangeShift = parameters.rangeShift || 0;
		this.values = parameters.values || [];
	}
	//**********************************************************************************
	static get format()
	{
		return 0;
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 *
	 * @param {!SeqStream} stream
	 * @param {!number} tableStart
	 *
	 * @returns {boolean} Result of the function
	 */
	toStream(stream, tableStart)
	{
		const size = this.map.size;

		stream.appendUint16(size);

		const log2TablesSize =  Math.floor(Math.log2(size));
		const highestPowerOf2 = Math.pow(2, log2TablesSize);

		stream.appendUint16(highestPowerOf2 << 4); // searchRange
		stream.appendUint16(log2TablesSize); // entrySelector
		stream.appendUint16((size - highestPowerOf2) << 4); // rangeShift

		for(const [key, value] of this.map.entries())
		{
			const pair = /(\d+)-(\d+)/g.exec(key);
			if(pair.length !== 3)
				throw new Error("Incorrectly formatted map for KERN - format 0");

			stream.appendUint16(pair[1]); // left
			stream.appendUint16(pair[2]); // right
			stream.appendUint16(value);
		}

		return true;
	}
	//**********************************************************************************
	/**
	 * Convert SeqStream data to object
	 *
	 * @param {!SeqStream} stream
	 *
	 * @returns {*} Result of the function
	 */
	static fromStream(stream)
	{
		const nPairs = stream.getUint16();
		const searchRange = stream.getUint16();
		const entrySelector = stream.getUint16();
		const rangeShift = stream.getUint16();

		const map = new Map();
		const values = [];

		for(let j = 0; j < nPairs; j++)
		{
			const left = stream.getUint16();
			const right = stream.getUint16();
			const value = stream.getInt16();

			values.push({
				left,
				right,
				value
			});

			map.set(`${left.toString()}-${right.toString()}`, value);
		}

		return new Format0({
			map,
			nPairs,
			searchRange,
			entrySelector,
			rangeShift,
			values
		});
	}
	//**********************************************************************************
}
//**************************************************************************************
class TwoD
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		this.array = parameters.array || [];
	}
	//**********************************************************************************
	get rows()
	{
		return this.array.length;
	}
	//**********************************************************************************
	get columns()
	{
		if(this.array.length)
			return this.array[0].length;

		return 0;
	}
	//**********************************************************************************
	row(index)
	{
		if(index <= this.array.length)
			return this.array[index];

		return [];
	}
	//**********************************************************************************
	column(index)
	{
		const result = [];

		if(this.array.length)
		{
			for(const element of this.array)
			{
				if(index <= element.length)
					result.push(element[index]);
			}
		}

		return result;
	}
	//**********************************************************************************
	deleteRow(index)
	{
		this.array.splice(index, 1);
	}
	//**********************************************************************************
	deleteColumn(index)
	{
		for(const element of this.array)
			element.splice(index, 1);
	}
	//**********************************************************************************
}
//**************************************************************************************
export class Format2 extends Format
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		this.rowWidth = parameters.rowWidth || 0;
		this.leftOffsetTable = parameters.leftOffsetTable || 0;
		this.rightOffsetTable = parameters.rightOffsetTable || 0;
		this.array = parameters.array || 0;

		this.leftTable = parameters.leftTable || {};
		this.rightTable = parameters.rightTable || {};
	}
	//**********************************************************************************
	static get format()
	{
		return 2;
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 *
	 * @param {!SeqStream} stream
	 * @param {!number} tableStart
	 *
	 * @returns {boolean} Result of the function
	 */
	toStream(stream, tableStart)
	{
		//region Initial variables
		const rows = new Map();
		const columns = new Map();

		let rowMin = null;
		let rowMax = null;

		let columnMin = null;
		let columnMax = null;

		let count = 0;
		//endregion

		//region Make an initial 2D array from the kerning map
		for(const [key, value] of this.map.entries())
		{
			const pair = /(\d+)-(\d+)/g.exec(key);
			if(pair.length !== 3)
				throw new Error("Incorrectly formatted map for KERN - format 0");

			const left = parseInt(pair[1], 10);
			const right = parseInt(pair[2], 10);

			rowMin = (rowMin === null) ? left : Math.min(rowMin, left);
			rowMax = (rowMax === null) ? left : Math.max(rowMax, left);

			columnMin = (columnMin === null) ? right : Math.min(columnMin, right);
			columnMax = (columnMax === null) ? left : Math.max(columnMax, right);

			let row = rows.get(left);
			if(typeof row === "undefined")
				row = [];

			row.push({
				right,
				value
			});

			if(columns.has(right) === false)
			{
				columns.set(right, count);
				count++;
			}

			rows.set(left, row);
		}

		//region Transform rows and columns
		const transformedRows = [];

		for(const key of rows.keys())
			transformedRows.push([key]);

		const transformedColumns = [];

		for(const key of columns.keys())
			transformedColumns.push([key]);
		//endregion

		const array = [];

		for(const value of rows.values())
		{
			const arrayValue = new Array(columns.size);
			arrayValue.fill(0);

			for(const element of value)
				arrayValue[columns.get(element.right)] = element.value;

			array.push(arrayValue);
		}
		//endregion

		//region Optimize array by collapsing same rows and columns
		const twoDemensionArray = new TwoD({ array });

		let changed = false;

		do
		{
			changed = false;

			//region Inspect rows
			for(let i = 0; i < twoDemensionArray.rows; i++)
			{
				const rowArray = transformedRows[i];

				for(let j = (i + 1); j < twoDemensionArray.rows;)
				{
					if(twoDemensionArray.row(i).join(",") === twoDemensionArray.row(j).join(","))
					{
						twoDemensionArray.deleteRow(j);

						rowArray.push(...transformedRows[j]);
						transformedRows.splice(j, 1);

						changed = true;
					}
					else
						j++;
				}

				transformedRows[i] = rowArray;
			}
			//endregion

			//region Inspect columns
			for(let i = 0; i < twoDemensionArray.columns; i++)
			{
				const columnArray = transformedColumns[i];

				for(let j = (i + 1); j < twoDemensionArray.columns;)
				{
					if(twoDemensionArray.column(i).join(",") === twoDemensionArray.column(j).join(","))
					{
						twoDemensionArray.deleteColumn(j);

						columnArray.push(...transformedColumns[j]);
						transformedColumns.splice(j, 1)

						changed = true;
					}
					else
						j++;
				}

				transformedColumns[i] = columnArray;
			}
			//endregion
		}while(changed);
		//endregion

		//region Make final array with kerning values
		const finalColumns = twoDemensionArray.columns + 1;

		const kerningArrayLength = (twoDemensionArray.rows + 1) * finalColumns * 2;

		const kerningBuffer = new ArrayBuffer(kerningArrayLength);
		const dataView = new DataView(kerningBuffer);

		const constOffset = finalColumns + 1;

		for(let i = 0; i < twoDemensionArray.rows; i++)
		{
			const row = twoDemensionArray.row(i);

			for(let j = 0; j < row.length; j++)
				dataView.setInt16((constOffset + j + i * finalColumns) * 2, row[j]);
		}
		//endregion

		//region Store "Format 2" header values
		const leftOffsetTableLength = (rowMax - rowMin + 1) * 2 + 4;

		const arrayStart = tableStart + 8;

		stream.appendUint16(finalColumns * 2); // rowWidth
		stream.appendUint16(arrayStart + kerningArrayLength); // leftOffsetTable
		stream.appendUint16(arrayStart + kerningArrayLength + leftOffsetTableLength); // rightOffsetTable
		stream.appendUint16(arrayStart); // array
		//endregion

		//region Append "array" value
		stream.appendView(new Uint8Array(kerningBuffer));
		//endregion

		//region Append "leftOffsetTable"
		//region Append header
		stream.appendUint16(rowMin); // firstGlyph
		stream.appendUint16(rowMax - rowMin + 1); // nGlyphs
		//endregion

		//region Set default offset for all possible glyphs
		const leftOffsetsTableMapArray = [];

		for(let i = rowMin; i <= rowMax; i++)
			leftOffsetsTableMapArray.push([i, arrayStart]);
		//endregion

		//region Fill map with real kerning values
		const leftOffsetsTableMap = new Map(leftOffsetsTableMapArray);

		for(let i = 0; i < transformedRows.length; i++)
		{
			const rowArray = transformedRows[i];

			for(const element of rowArray)
				leftOffsetsTableMap.set(element, 2 * (i + 1) * finalColumns + arrayStart);
		}
		//endregion

		//region Store final values into the stream
		for(const value of leftOffsetsTableMap.values())
			stream.appendUint16(value);
		//endregion
		//endregion

		//region Append "rightOffsetTable"
		//region Append header
		stream.appendUint16(columnMin); // firstGlyph
		stream.appendUint16(columnMax - columnMin + 1); // nGlyphs
		//endregion

		//region Set default offset for all possible glyphs
		const rightOffsetsTableMapArray = [];

		for(let i = columnMin; i <= columnMax; i++)
			rightOffsetsTableMapArray.push([i, 0]);
		//endregion

		//region Fill map with real kerning values
		const rightOffsetsTableMap = new Map(rightOffsetsTableMapArray);

		for(let i = 0; i < transformedColumns.length; i++)
		{
			const columnArray = transformedColumns[i];

			for(const element of columnArray)
				rightOffsetsTableMap.set(element, (i + 1) * 2);
		}
		//endregion

		//region Store final values into the stream
		for(const value of rightOffsetsTableMap.values())
			stream.appendUint16(value);
		//endregion
		//endregion

		return true;
	}
	//**********************************************************************************
	/**
	 * Convert SeqStream data to object
	 *
	 * @param {!SeqStream} stream
	 * @param {!number} tableStart
	 * @param {!number} tableLength
	 *
	 * @returns {*} Result of the function
	 */
	static fromStream(stream, tableStart, tableLength)
	{
		//region Initialize "DataView"
		const start = stream.start - tableStart;
		const tableStream = new SeqStream({ stream: stream.stream.slice(start, start + tableLength) });
		const view = new DataView(tableStream.stream.buffer);
		//endregion

		//region Read "simple header" values
		const rowWidth = view.getUint16(tableStart);
		const leftOffsetTable = view.getUint16(tableStart + 2);
		const rightOffsetTable = view.getUint16(tableStart + 4);
		const array = view.getUint16(tableStart + 6);
		//endregion

		//region Read "left-hand" offsets
		const leftTable = { offsets: [] };

		leftTable.firstGlyph = view.getUint16(leftOffsetTable);
		leftTable.nGlyphs = view.getUint16(leftOffsetTable + 2);

		let constOffset = leftOffsetTable + 4;

		for(let i = 0; i < leftTable.nGlyphs; i++)
		{
			const offset = view.getUint16(constOffset + i * 2);
			leftTable.offsets.push(offset);
		}
		//endregion

		//region Read "right-hand" offsets
		const rightTable = { offsets: [] };

		rightTable.firstGlyph = view.getUint16(rightOffsetTable);
		rightTable.nGlyphs = view.getUint16(rightOffsetTable + 2);

		constOffset = rightOffsetTable + 4;

		for(let i = 0; i < rightTable.nGlyphs; i++)
		{
			const offset = view.getUint16(constOffset + i * 2);
			rightTable.offsets.push(offset);
		}
		//endregion

		//region Produce final kerning map
		const map = new Map();

		for(let i = 0; i < leftTable.nGlyphs; i++)
		{
			for(let j = 0; j < rightTable.nGlyphs; j++)
			{
				const value = view.getInt16(leftTable.offsets[i] + rightTable.offsets[j]);
				if(value)
					map.set(`${(i + leftTable.firstGlyph).toString()}-${(j + rightTable.firstGlyph).toString()}`, value);
			}
		}
		//endregion

		return new Format2({
			map,
			rowWidth,
			leftOffsetTable,
			rightOffsetTable,
			array,
			leftTable,
			rightTable
		});
	}
	//**********************************************************************************
}
//**************************************************************************************
export class KERN extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.version = parameters.version || 0x0000;
		this.tables = parameters.tables || [];
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x6B65726E;
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 *
	 * @param {!SeqStream} stream
	 *
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
		switch(this.version)
		{
			case 0:
				{
					stream.appendUint16(this.version);
					stream.appendUint16(this.tables.length);

					for(const table of this.tables)
					{
						const tableStream = new SeqStream();
						table.value.toStream(tableStream, 6);

						stream.appendUint16(table.version);
						stream.appendUint16(tableStream.length + 6);

						let coverage = 0;

						if(table.coverage.horizontal)
							coverage |= 0x0001;
						if(table.coverage.minimum)
							coverage |= 0x0002;
						if(table.coverage.crossStream)
							coverage |= 0x0004;
						if(table.coverage.override)
							coverage |= 0x0008;

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

					for(const table of this.tables)
					{
						const tableStream = new SeqStream();
						table.value.toStream(tableStream, 8);

						stream.appendUint32(tableStream.length + 8);

						let coverage = 0;

						if(table.coverage.kernVertical)
							coverage |= 0x8000;
						if(table.coverage.kernCrossStream)
							coverage |= 0x4000;
						if(table.coverage.kernVariation)
							coverage |= 0x2000;

						coverage |= table.coverage.format;

						stream.appendUint16(coverage);
						stream.appendUint16(table.tupleIndex);

						stream.append(tableStream.stream);
					}
				}
				break;
			default:
		}

		return true;
	}
	//**********************************************************************************
	/**
	 * Convert SeqStream data to object
	 *
	 * @param {!SeqStream} stream
	 *
	 * @returns {*} Result of the function
	 */
	static fromStream(stream)
	{
		let version = stream.getUint16();
		const tables = [];

		switch(version)
		{
			case 0:
				{
					const nTables = stream.getUint16();

					for(let i = 0; i < nTables; i++)
					{
						const table = {};

						table.version = stream.getUint16();
						table.length = stream.getUint16();

						const coverage = stream.getUint16();

						table.coverage = {};

						table.coverage.horizontal = coverage & 0x0001;
						table.coverage.minimum = (coverage & 0x0002) >> 1;
						table.coverage.crossStream = (coverage & 0x0004) >> 2;
						table.coverage.override = (coverage & 0x0008) >> 3;
						table.coverage.format = (coverage & 0xFF00) >> 8;

						switch(table.coverage.format)
						{
							case 0:
								table.value = Format0.fromStream(stream);
								break;
							case 2:
								table.value = Format2.fromStream(stream, 6, table.length);
								break;
							default:
						}

						tables.push(table);
					}
				}

				break;
			case 1:
				{
					stream.resetPosition();

					version = stream.getUint32();
					const nTables = stream.getUint32();

					for(let i = 0; i < nTables; i++)
					{
						const table = {};

						table.length = stream.getUint32();

						const coverage = stream.getUint16();

						table.tupleIndex = stream.getUint16();

						table.coverage = {};

						table.coverage.kernVertical = coverage & 0x8000;
						table.coverage.kernCrossStream = coverage & 0x4000;
						table.coverage.kernVariation = coverage & 0x2000;
						table.coverage.format = coverage & 0x00FF;

						switch(table.coverage.format)
						{
							case 0:
								table.value = Format0.fromStream(stream);
								break;
							case 2:
								table.value = Format2.fromStream(stream, 8, table.length);
								break;
							default:
						}

						tables.push(table);
					}
				}
				break;
			default:
		}


		return new KERN({
			version,
			tables
		});
	}
	//**********************************************************************************
	/**
	 * Find kerning value for pair of glyph indexes
	 *
	 * @param {!number} leftIndex Index of glyph from left side
	 * @param {!number} rightIndex Index of glyph from right side
	 * @param {?number} [table=0] Index of kerning table to find kerning value
	 *
	 * @return {?number}
	 */
	find(leftIndex, rightIndex, table = 0)
	{
		if(this.tables.length < (table + 1))
			return 0;

		const result = this.tables[table].value.map.get(`${leftIndex.toString()}-${rightIndex.toString()}`);
		if(typeof result === "undefined")
			return 0;

		return result;
	}
	//**********************************************************************************
	/**
	 * Find kerning values for array of glyph indexes
	 *
	 * @param {Array<number>} array Array of glyph indexes
	 * @param {?number} [table=0] Index of kerning table to find kerning value
	 *
	 * @return {[]|number[]}
	 */
	findForArray(array, table = 0)
	{
		if(this.tables.length < (table + 1))
			return Array.from(array, element => 0);

		const result = [];

		for(let i = 0; i < (array.length - 1); i++)
		{
			const left = array[i];
			const right = array[i + 1];

			result.push(this.find(left, right, table));
		}

		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************

