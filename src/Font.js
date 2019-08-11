import { SeqStream } from "bytestreamjs";
import { BaseClass } from "./BaseClass.js";
import { unicodePointsToCodePoints } from "./common.js";
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
 * Calculating checksum for most tables
 *
 * @param {ArrayBuffer} buffer
 * @returns {number}
 */
function calculateCheckSum(buffer)
{
	const paddedView = new Uint8Array([...new Uint8Array(buffer), ...new Uint8Array(4 - (buffer.byteLength % 4))]);
	const dataView = new DataView(paddedView.buffer);

	let sum = new Uint32Array([0]);

	for(let i = 0; i < dataView.byteLength; i += 4)
		sum[0] += dataView.getUint32(i);

	return sum[0];
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
	 * @param {!SeqStream} fontStream
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
		const encodeTable = (table) =>
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
		//region Initial variables
		const warnings = [];
		let headCheckSum = 0;

		const tableStreams = new Map();
		//endregion

		//region Get head values for entire font
		const scalerType = stream.getUint32();
		const numTables = stream.getUint16();
		const searchRange = stream.getUint16();
		const entrySelector = stream.getUint16();
		const rangeShift = stream.getUint16();
		//endregion

		//region Get head values for each table
		for(let i = 0; i < numTables; i++)
		{
			const tag = stream.getUint32();
			const checkSum = stream.getUint32();
			const offset = stream.getUint32();
			const length = stream.getUint32();

			//region Check "checkSum" value
			const tableStream = new SeqStream({ stream: stream.stream.slice(offset, offset + length) });

			if(calculateCheckSum(tableStream.buffer) !== checkSum)
			{
				// In case of HEAD there is more specialized procedure for checkSum calculation
				if(tag === Tables.HEAD.tag)
					headCheckSum = checkSum;
				else
					warnings.push(`Invalid checkSum for ${tag}`);
			}
			//endregion

			tableStreams.set(tag, tableStream);
		}
		//endregion

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
							//region Calculate checkSum for the HEAD table
							const headView = new DataView(tableStream.buffer);
							headView.setUint32(8, 0);

							if(calculateCheckSum(headView.buffer) !== headCheckSum)
								warnings.push(`Invalid checkSum for ${Tables.HEAD.tag} (HEAD)`);
							//endregion

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
	get numGlyphs()
	{
		//region Get MAXP table reference
		const maxp = this.tables.get(Tables.MAXP.tag);
		if(typeof maxp === "undefined")
			throw new Error("No MAXP table in the font");
		//endregion

		return maxp.numGlyphs;
	}
	//**********************************************************************************
	get glyphs()
	{
		//region Return pre-calculated values in exist
		if("_glyphs" in this)
			return this._glyphs;
		//endregion

		//region Get GLYF table reference
		const glyf = this.tables.get(Tables.GLYF.tag);
		if(typeof glyf === "undefined")
			throw new Error("No GLYF table in the font");

		this._glyphs = glyf.glyphs.slice();
		//endregion

		//region Fill array of glyphs with combined values
		//region Get information about horizontal metrics
		const hmtx = this.tables.get(Tables.HMTX.tag);
		if(typeof hmtx === "undefined")
			throw new Error("No HMTX table in the font");

		let leastAdvanceWidth = 0;

		for(let i = 0; i < this._glyphs.length; i++)
		{
			this._glyphs[i].index = i;

			if(i >= hmtx.hMetrics.length)
			{
				this._glyphs[i].hAdvanceWidth = leastAdvanceWidth;
				this._glyphs[i].leftSideBearing = hmtx.leftSideBearings[0];
			}
			else
			{
				leastAdvanceWidth = hmtx.hMetrics[i].advanceWidth;

				this._glyphs[i].hAdvanceWidth = leastAdvanceWidth;
				this._glyphs[i].leftSideBearing = hmtx.hMetrics[i].leftSideBearing;
			}
		}
		//endregion

		//region Get information about Unicode codes
		const cmap = this.tables.get(Tables.CMAP.tag);
		if(typeof cmap !== "undefined")
		{
			for(let i = 0; i < this._glyphs.length; i++)
				this._glyphs[i].unicodes = cmap.code(i).slice();
		}
		//endregion
		//endregion

		return this._glyphs;
	}
	//**********************************************************************************
	get unitsPerEm()
	{
		//region Get HEAD table reference
		const head = this.tables.get(Tables.HEAD.tag);
		if(typeof head === "undefined")
			throw new Error("No HEAD table in the font");
		//endregion

		return head.unitsPerEm;
	}
	//**********************************************************************************
	get bbox()
	{
		//region Initial variables
		const glyphs = this.glyphs;
		const unitsPerEm = this.unitsPerEm;

		const xMin = [];
		const yMin = [];
		const xMax = [];
		const yMax = [];
		//endregion

		//region Fill necessary arrays
		for(const glyph of glyphs)
		{
			xMin.push(glyph.xMin);
			yMin.push(glyph.yMin);
			xMax.push(glyph.xMax);
			yMax.push(glyph.yMax);
		}
		//endregion

		return [
			Math.min.apply(null, xMin) / unitsPerEm,
			Math.min.apply(null, yMin) / unitsPerEm,
			Math.max.apply(null, xMax) / unitsPerEm,
			Math.max.apply(null, yMax) / unitsPerEm,
		];
	}
	//**********************************************************************************
	get italicAngle()
	{
		//region Get POST table reference
		const post = this.tables.get(Tables.POST.tag);
		if(typeof post === "undefined")
			throw new Error("No POST table in the font");
		//endregion

		return post.italicAngle;
	}
	//**********************************************************************************
	get fontFamily()
	{
		//region Get NAME table reference
		const name = this.tables.get(Tables.NAME.tag);
		if(typeof name === "undefined")
			return null;
		//endregion
		
		for(const nameRecord of name.nameRecords)
		{
			if((nameRecord.nameID === 1) && (nameRecord.platformID === 0))
				return String.fromCodePoint(...unicodePointsToCodePoints(nameRecord.value, true, true, false));
		}

		return null;
	}
	//**********************************************************************************
	get postScriptName()
	{
		//region Get NAME table reference
		const name = this.tables.get(Tables.NAME.tag);
		if(typeof name === "undefined")
			return null;
		//endregion

		for(const nameRecord of name.nameRecords)
		{
			if((nameRecord.nameID === 6) && (nameRecord.platformID === 0))
				return String.fromCodePoint(...unicodePointsToCodePoints(nameRecord.value, true, true, false));
		}

		return null;
	}
	//**********************************************************************************
	static makeTTF(parameters = {})
	{
		//region Check input parameters
		if(("glyphs" in parameters) === false)
			throw new Error("Missing mandatory parameter glyphs");

		let tables = new Map();
		if("tables" in parameters)
			tables = parameters.tables;
		//endregion

		//region Get major metrics from array of glyphs
		for(const glyph in parameters.glyphs)
		{
			// glyph -> hmtx (vmtx) -> hhea (vhea) -> cmap -> loca -> maxp
			// "name" is a side table, "post" is mostly template
		}
		//endregion
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

		const numGlyphs = this.numGlyphs;
		//endregion

		//region Find correct number of bytes for GID codes
		let bytes = "00";

		switch(true)
		{
			case (numGlyphs > 0xFF):
				bytes = "0000";
				break;
			case (numGlyphs > 0xFFFF):
				bytes = "000000";
				break;
			case (numGlyphs > 0xFFFFFF):
				bytes = "00000000";
				break;
			case (numGlyphs > 0xFFFFFFFF):
				bytes = "0000000000";
				break;
		}
		//endregion

		//region Get CMAP table reference
		const cmap = this.tables.get(Tables.CMAP.tag);
		if(typeof cmap === "undefined")
			throw new Error("No CMAP table in the font");
		//endregion

		//region Find GIDs for all charpoints
		for(const char of str)
		{
			for(let i = 0; i < char.length; i++)
			{
				// Replace absent chars via GID = 0 (as it is required by standard)
				const gid = cmap.gid(char.codePointAt(i), platformID, platformSpecificID) || 0;
				
				result.push(`${bytes}${gid.toString(16).toLocaleUpperCase()}`.slice(-1 * bytes.length));
			}
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
