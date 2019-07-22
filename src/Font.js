import { SeqStream } from "bytestreamjs";
import { BaseClass } from "./BaseClass.js";
import * as Tables from "./Tables.js";
//**************************************************************************************
export class ScalerTypes
{
	//**********************************************************************************
	constructor()
	{
		throw new Error("Only static methods allowed for ScalerTypes");
	}
	//**********************************************************************************
	static get true()
	{
		return 0x74727565;
	}
	//**********************************************************************************
	static get x00010000()
	{
		return 0x00010000;
	}
	//**********************************************************************************
	static get typ1()
	{
		return 0x74797031;
	}
	//**********************************************************************************
	static get OTTO()
	{
		return 0x4F54544F;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Got core of the function from https://github.com/opentypejs/opentype.js/blob/master/src/tables/sfnt.js
 *
 * @param {ArrayBuffer} buffer
 *
 * @returns {number}
 */
function calculateCheckSum(buffer)
{
	const bytes = Array.from(new Uint8Array(buffer));

	while(bytes.length % 4 !== 0)
		bytes.push(0);

	let sum = 0;

	for(let i = 0; i < bytes.length; i += 4)
	{
		sum += (bytes[i] << 24) +
			(bytes[i + 1] << 16) +
			(bytes[i + 2] << 8) +
			(bytes[i + 3]);
	}

	sum %= Math.pow(2, 32);

	return sum;
}
//**************************************************************************************
export class Font extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.scalerType = parameters.scalerType || ScalerTypes.OTTO;
		this.searchRange = parameters.searchRange || 0;
		this.entrySelector = parameters.entrySelector || 0;
		this.rangeShift = parameters.rangeShift || 0;
		this.tables = parameters.tables || new Map();

		this.warnings = parameters.warnings || [];
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
		//region Initial variables
		let tablesData = new Map();

		let offset = 12 + (this.tables.size * 16);

		const fontStream = new SeqStream();

		const log2TablesSize =  Math.floor(Math.log2(this.tables.size));
		const highestPowerOf2 = Math.pow(2, log2TablesSize);
		//endregion

		//region Append major "sfnt" header
		fontStream.appendUint32(this.scalerType);
		fontStream.appendUint16(this.tables.size);
		fontStream.appendUint16(highestPowerOf2 << 4);
		fontStream.appendUint16(log2TablesSize);
		fontStream.appendUint16((this.tables.size - highestPowerOf2) << 4);
		//endregion

		//region Encode tables data
		const encodeTable = table =>
		{
			//region Common encoding
			const tableStream = new SeqStream();

			const tableResult = table.toStream(tableStream);
			if(tableResult !== true)
				throw new Error(`Error while processing ${table.className}`);
			//endregion

			//region Special additional encoding
			switch(table.constructor.tag)
			{
				case Tables.GLYF.tag:
					{
						//region Calculate "indexToLocFormat" value
						let indexToLocFormat = 0;

						for(const element of table.loca)
						{
							if((element > 0xFFFF) || (element % 2))
							{
								indexToLocFormat = 1;
								break;
							}
						}
						//endregion

						//region Initialize "loca" table
						let loca = this.tables.get(Tables.LOCA.tag);
						if(typeof loca === "undefined")
							loca = new Tables.LOCA();

						loca.offsets = table.loca;
						loca.indexToLocFormat = indexToLocFormat;

						this.tables.set(Tables.LOCA.tag, loca);

						encodeTable(loca);
						//endregion

						//region Initialize "maxp" table
						let maxp = this.tables.get(Tables.MAXP.tag);
						if(typeof maxp === "undefined")
							maxp = new Tables.MAXP();

						// noinspection JSUnresolvedVariable
						maxp.numGlyphs = table.glyphs.length;

						this.tables.set(Tables.MAXP.tag, maxp);

						encodeTable(maxp);
						//endregion
					}

					break;
				case Tables.LOCA.tag:
					{
						//region Initialize "maxp" table
						let maxp = this.tables.get(Tables.MAXP.tag);
						if(typeof maxp === "undefined")
							maxp = new Tables.MAXP();

						maxp.numGlyphs = (table.offsets.length - 1);

						this.tables.set(Tables.MAXP.tag, maxp);

						encodeTable(maxp);
						//endregion

						//region Initialize "head" table
						let head = this.tables.get(Tables.HEAD.tag);
						if(typeof head === "undefined")
							head = new Tables.HEAD();

						head.indexToLocFormat = table.indexToLocFormat;

						this.tables.set(Tables.HEAD.tag, head);

						encodeTable(head);
						//endregion
					}

					break;
				default:
			}
			//endregion

			tablesData.set(table.constructor.tag, tableStream);
		};

		for(const table of this.tables.values())
			encodeTable(table);
		//endregion

		//region Encode tables header
		tablesData = new Map([...tablesData.entries()].sort((a, b) => (a[0] - b[0])));

		for(const [tag, data] of tablesData.entries())
		{
			fontStream.appendUint32(tag);
			fontStream.appendUint32(calculateCheckSum(data.buffer));
			fontStream.appendUint32(offset);
			fontStream.appendUint32(data.length);

			const padding = data.length % 4;
			if(padding)
				offset += (data.length + (4 - padding));
			else
				offset += data.length;
		}
		//endregion

		//region Encode tables data
		let headStart = null;

		for(const [tag, data] of tablesData.entries())
		{
			if(tag === Tables.HEAD.tag)
				headStart = fontStream._start;

			fontStream.appendView(new Uint8Array(data.buffer));

			const padding = data.length % 4;
			if(padding)
				fontStream.appendView(new Uint8Array(new ArrayBuffer(4 - padding)));
		}

		if(headStart === null)
			throw new Error("Missing mandatory table HEAD");
		//endregion

		//region Calculate "checkSumAdjustment" for "head" table and set it
		const fontStreamBuffer = fontStream.buffer;

		fontStream._start = headStart + 8;
		fontStream.appendUint32(0xB1B0AFBA - calculateCheckSum(fontStreamBuffer));
		fontStream.length = fontStreamBuffer.byteLength;
		//endregion

		//region Append "fontStream" to main "stream"
		stream.appendView(new Uint8Array(fontStream.buffer));
		//endregion

		return true;
	}
	//**********************************************************************************
	/**
	 * Convert SeqStream data to object
	 * @param {!SeqStream} stream
	 * @returns {*} Result of the function
	 */
	static fromStream(stream)
	{
		const scalerType = stream.getUint32();
		const numTables = stream.getUint16();
		const searchRange = stream.getUint16();
		const entrySelector = stream.getUint16();
		const rangeShift = stream.getUint16();

		const warnings = [];

		const tableStreams = new Map();

		for(let i = 0; i < numTables; i++)
		{
			const tag = stream.getUint32();
			const checkSum = stream.getUint32();
			const offset = stream.getUint32();
			const length = stream.getUint32();

			//region Check "checkSum" value
			const tableStream = new SeqStream({stream: stream.stream.slice(offset, offset + length)});

			if(calculateCheckSum(tableStream.buffer) !== checkSum)
				warnings.push(`Invalid checkSum for ${tag}`);
			//endregion

			tableStreams.set(tag, tableStream);
		}

		//region Parse streams for all tables
		const tables = new Map();

		function parseTable(tag)
		{
			const tableStream = tableStreams.get(tag);
			if(typeof tableStream === "undefined")
				throw new Error(`No stream for tag ${tag}`);

			switch(tag)
			{
				case Tables.CMAP.tag:
					{
						let result = tables.get(Tables.CMAP.tag);
						if (typeof result === "undefined")
						{
							result = Tables.CMAP.fromStream(tableStream);
							tables.set(Tables.CMAP.tag, result);
						}

						return result;
					}
				case Tables.HEAD.tag:
					{
						let result = tables.get(Tables.HEAD.tag);
						if (typeof result === "undefined")
						{
							result = Tables.HEAD.fromStream(tableStream);
							tables.set(Tables.HEAD.tag, result);
						}

						return result;
					}
				case Tables.HHEA.tag:
					{
						let result = tables.get(Tables.HHEA.tag);
						if (typeof result === "undefined")
						{
							result = Tables.HHEA.fromStream(tableStream);
							tables.set(Tables.HHEA.tag, result);
						}

						return result;
					}
				case Tables.HMTX.tag:
					{
						let result = tables.get(Tables.HMTX.tag);
						if (typeof result === "undefined")
						{
							let hhea = parseTable(Tables.HHEA.tag);
							if(hhea === null)
								throw new Error("Something went wrong while parsing 'hhea' table");

							const maxp = parseTable(Tables.MAXP.tag);
							if(maxp === null)
								throw new Error("Something went wrong while parsing 'maxp' table");

							result = Tables.HMTX.fromStream(maxp.numGlyphs, hhea.numOfLongHorMetrics, tableStream);
							tables.set(Tables.HMTX.tag, result);
						}

						return result;
					}
				case Tables.MAXP.tag:
					{
						let result = tables.get(Tables.MAXP.tag);
						if (typeof result === "undefined")
						{
							result = Tables.MAXP.fromStream(tableStream);
							tables.set(Tables.MAXP.tag, result);
						}

						return result;
					}
				case Tables.LOCA.tag:
					{
						let result = tables.get(Tables.LOCA.tag);
						if (typeof result === "undefined")
						{
							const maxp = parseTable(Tables.MAXP.tag);
							if(maxp === null)
								throw new Error("Something went wrong while parsing 'maxp' table");

							const head = parseTable(Tables.HEAD.tag);
							if(head === null)
								throw new Error("Something went wrong while parsing 'head' table");

							result = Tables.LOCA.fromStream(head.indexToLocFormat, maxp.numGlyphs, tableStream);
							tables.set(Tables.LOCA.tag, result);
						}

						return result;
					}
				case Tables.GLYF.tag:
				{
					let result = tables.get(Tables.GLYF.tag);
					if (typeof result === "undefined")
					{
						const maxp = parseTable(Tables.MAXP.tag);
						if(maxp === null)
							throw new Error("Something went wrong while parsing 'maxp' table");

						const loca = parseTable(Tables.LOCA.tag);
						if(loca === null)
							throw new Error("Something went wrong while parsing 'loca' table");

						result = Tables.GLYF.fromStream(maxp.numGlyphs, loca, tableStream);
						tables.set(Tables.GLYF.tag, result);
					}

					return result;
				}
				case Tables.NAME.tag:
					{
						let result = tables.get(Tables.NAME.tag);
						if (typeof result === "undefined")
						{
							result = Tables.NAME.fromStream(tableStream);
							tables.set(Tables.NAME.tag, result);
						}

						return result;
					}
				case Tables.POST.tag:
					{
						let result = tables.get(Tables.POST.tag);
						if (typeof result === "undefined")
						{
							result = Tables.POST.fromStream(tableStream);
							tables.set(Tables.POST.tag, result);
						}

						return result;
					}
				case Tables.OS2.tag:
					{
						let result = tables.get(Tables.OS2.tag);
						if (typeof result === "undefined")
						{
							result = Tables.OS2.fromStream(tableStream);
							tables.set(Tables.OS2.tag, result);
						}

						return result;
					}
				case Tables.CVT.tag:
					{
						let result = tables.get(Tables.CVT.tag);
						if (typeof result === "undefined")
						{
							result = Tables.CVT.fromStream(tableStream);
							tables.set(Tables.CVT.tag, result);
						}

						return result;
					}
				case Tables.FPGM.tag:
					{
						let result = tables.get(Tables.FPGM.tag);
						if (typeof result === "undefined")
						{
							result = Tables.FPGM.fromStream(tableStream);
							tables.set(Tables.FPGM.tag, result);
						}

						return result;
					}
				case Tables.HDMX.tag:
					{
						let result = tables.get(Tables.HDMX.tag);
						if (typeof result === "undefined")
						{
							const maxp = parseTable(Tables.MAXP.tag);
							if(maxp === null)
								throw new Error("Something went wrong while parsing 'maxp' table");

							result = Tables.HDMX.fromStream(maxp.numGlyphs, tableStream);
							tables.set(Tables.HDMX.tag, result);
						}

						return result;
					}
				case Tables.PREP.tag:
					{
						let result = tables.get(Tables.PREP.tag);
						if (typeof result === "undefined")
						{
							result = Tables.PREP.fromStream(tableStream);
							tables.set(Tables.PREP.tag, result);
						}

						return result;
					}
				case 0x43464632:
					break;
				default:
				//throw new Error(`Invalid table tag - ${tag}`);
			}

			return null;
		}

		for(const tag of tableStreams.keys())
			parseTable(tag);
		//endregion

		return new Font({
			scalerType,
			searchRange,
			entrySelector,
			rangeShift,
			warnings,
			tables
		});
	}
	//**********************************************************************************
	/**
	 * Return array GID (as string hexadecimal representation) for particular string
	 *
	 * @param {string} str
	 * @param {number} platformID
	 * @param {number} platformSpecificID
	 * @return {Array}
	 */
	stringToGIDs(str, platformID = 3, platformSpecificID = 1)
	{
		//region Initial variables
		const result = [];
		//endregion

		//region Get CMAP table reference
		const cmap = this.tables.get(Tables.CMAP.tag);
		if(typeof cmap === "undefined")
			throw new Error("No CMAP table in the font");
		//endregion

		//region Get MAXP table reference
		const maxp = this.tables.get(Tables.MAXP.tag);
		if(typeof maxp === "undefined")
			throw new Error("No MAXP table in the font");
		//endregion

		//region Find correct number of bytes for GID codes
		let bytes = "00";

		switch(true)
		{
			case (maxp.numGlyphs > 0xFF):
				bytes = "0000";
				break;
			case (maxp.numGlyphs > 0xFFFF):
				bytes = "000000";
				break;
			case (maxp.numGlyphs > 0xFFFFFF):
				bytes = "00000000";
				break;
			case (maxp.numGlyphs > 0xFFFFFFFF):
				bytes = "0000000000";
				break;
		}
		//endregion

		//region Find GIDs for all charpoints
		for(const char of str)
		{
			for(let i = 0; i < char.length; i++)
			{
				const gid = cmap.gid(char.codePointAt(i), platformID, platformSpecificID);
				result.push(`${bytes}${gid.toString(16).toLocaleUpperCase()}`.slice(-1 * bytes.length));
			}
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
