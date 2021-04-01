import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass.js";
//**************************************************************************************
export class CMAP extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.version = parameters.version || 0;
		this.subTables = parameters.subTables || [];
	}
	//**********************************************************************************
	static get className()
	{
		return "CMAP";
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x636D6170;
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
		stream.appendUint16(this.version);
		stream.appendUint16(this.subTables.length);

		const subTablesHeader = new SeqStream();
		const subTablesData = new SeqStream();

		for(const subTable of this.subTables)
		{
			if(subTable === null)
				continue;

			const offset = 4 + (this.subTables.length * 8) + subTablesData.length;

			const subTableStream = new SeqStream();

			const tableResult = subTable.toStream(subTableStream);
			if(tableResult !== true)
				throw new Error(`Error while processing ${subTable.className}`);

			subTablesHeader.appendUint16(subTable.platformID);
			subTablesHeader.appendUint16(subTable.platformSpecificID);
			subTablesHeader.appendUint32(offset);

			subTablesData.appendView(new Uint8Array(subTableStream.buffer));
		}

		stream.appendView(new Uint8Array(subTablesHeader.buffer));
		stream.appendView(new Uint8Array(subTablesData.buffer));

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
		const version = stream.getUint16();
		const numberSubtables = stream.getUint16();

		const subTables = [];

		for(let i = 0; i < numberSubtables; i++)
		{
			const platformID = stream.getUint16();
			const platformSpecificID = stream.getUint16();
			const offset = stream.getUint32();

			subTables.push({
				platformID,
				platformSpecificID,
				offset
			});
		}

		for(let i = 0; i < subTables.length; i++)
		{
			const subTableStream = new SeqStream({ stream: stream.stream.slice(subTables[i].offset) });

			//region Parse subtable
			const format = subTableStream.getUint16();

			let subTable = { format };

			switch(format)
			{
				case 0:
					subTable = Format0.fromStream(subTableStream);
					break;
				case 4:
					subTable = Format4.fromStream(subTableStream);
					break;
				case 6:
					subTable = Format6.fromStream(subTableStream);
					break;
				case 12:
					subTable = Format12.fromStream(subTableStream);
					break;
				case 14:
					subTable = Format14.fromStream(subTableStream);
					break;
				default:
					console.log(`Unknow CMAP subtable format - ${format}`);
				//throw new Error(`Unknow CMAP subtable format - ${format}`);
			}

			//region Set upper lever subtable-specific information
			subTable.platformID = subTables[i].platformID;
			subTable.platformSpecificID = subTables[i].platformSpecificID;
			//endregion

			subTables[i] = subTable;
			//endregion
		}

		return new CMAP({
			version,
			subTables
		});
	}
	//**********************************************************************************
	gid(code, platformID = 3, platformSpecificID = 1)
	{
		// Replace absent chars via GID = 0 (as it is required by standard)
		let result = 0;
		
		for(const subTable of this.subTables)
		{
			if((subTable.platformID === platformID) && (subTable.platformSpecificID === platformSpecificID))
			{
				result = subTable.gid(code);
				break;
			}
		}
		
		return result;
	}
	//**********************************************************************************
	code(gid, platformID = 3, platformSpecificID = 1)
	{
		let result = [];

		for(const subTable of this.subTables)
		{
			if((subTable.platformID === platformID) && (subTable.platformSpecificID === platformSpecificID))
			{
				result = subTable.code(gid);
				break;
			}
		}

		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
export class CMAPSubTable extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.platformID = parameters.platformID || 0;
		this.platformSpecificID = parameters.platformSpecificID || 0;
	}
	//**********************************************************************************
	static get className()
	{
		return "CMAPSubTable";
	}
	//**********************************************************************************
}
//**************************************************************************************
export class Format4 extends CMAPSubTable
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		this.language = parameters.language || 0;
		this.segments = parameters.segments || [];
	}
	//**********************************************************************************
	static get className()
	{
		return "Format4";
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
		const segCountX2 = this.segments.length << 1;
		const searchRange = Math.pow(2, Math.floor(Math.log(this.segments.length) / Math.log(2))) * 2;

		const startCode = [];
		const endCode = [];
		const idDelta = [];
		const idRangeOffset = [];
		//endregion

		//region Analyze segments
		const segmentInformation = [];

		for(const segment of this.segments)
		{
			//region Initial variables
			let start = null;
			let end = null;

			let pKey = null;
			let pValue = null;

			let format = 0;
			//endregion

			//region Check all values in the segment
			segment.codeToGID = new Map([...segment.codeToGID.entries()].sort((a, b) => (a[0] - b[0])));

			for(const [key, value] of segment.codeToGID)
			{
				if(start === null)
					start = key;

				end = key;

				if(pKey === null)
					pKey = key;
				else
				{
					if((pKey + 1) !== key)
						throw new Error("Inconsistent information in CMAP segment");

					pKey = key;
				}

				if(pValue === null)
					pValue = value;
				else
				{
					if((pValue + 1) !== value)
						format = 1;

					pValue = value;
				}
			}
			//endregion

			//region Set correct "delta" values (useles in case "format = 1")
			const information = {
				start,
				end,
				delta: 0,
				format
			};

			if(format === 0)
				information.delta = (segment.codeToGID.get(information.start) - information.start);// & 0xFFFF;
			//endregion

			segmentInformation.push(information);
		}
		//endregion

		//region Write "format = 1" segments to temporary stream
		const format1Stream = new SeqStream();

		for(let i = 0; i < this.segments.length; i++)
		{
			if(segmentInformation[i].format === 1)
			{
				segmentInformation[i].offset = format1Stream._start + segCountX2 - (i << 1);

				for(const value of this.segments[i].codeToGID.values())
					format1Stream.appendUint16(value);
			}
		}
		//endregion

		//region Write information header
		stream.appendUint16(4); // CMAP format
		stream.appendUint16(14 + (4 * this.segments.length * 2) + format1Stream.length + 2); // +2 for "reservedPad"
		stream.appendUint16(this.language);
		stream.appendUint16(segCountX2);
		stream.appendUint16(searchRange);
		stream.appendUint16(Math.log(searchRange >> 1) / Math.log(2));
		stream.appendUint16(segCountX2 - searchRange);
		//endregion

		//region Write aux arrays
		for(const information of segmentInformation)
		{
			startCode.push(information.start);
			endCode.push(information.end);
			idDelta.push(information.delta);
			idRangeOffset.push(information.offset);
		}

		for(const code of endCode)
			stream.appendUint16(code);

		stream.appendUint16(0); // reservedPad

		for(const code of startCode)
			stream.appendUint16(code);

		for(const code of idDelta)
			stream.appendUint16(code);

		for(const code of idRangeOffset)
			stream.appendUint16(code);
		//endregion

		//region Finally append information about "format = 1" segments
		stream.appendView(new Uint8Array(format1Stream.buffer));
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
		//region Read major information
		const length = stream.getUint16();

		const language = stream.getUint16();
		const segCountX2 = stream.getUint16();
		const segCount = segCountX2 >> 1;
		const searchRange = stream.getUint16();
		const entrySelector = stream.getUint16();
		const rangeShift = stream.getUint16();
		//endregion

		//region Initialize "endCode" array
		const endCode = [];

		for(let i = 0; i < segCount; i++)
		{
			const code = stream.getUint16();
			endCode.push(code);
		}
		//endregion

		const reservedPad = stream.getUint16();

		//region Initialize "startCode" array
		const startCode = [];

		for(let i = 0; i < segCount; i++)
		{
			const code = stream.getUint16();
			startCode.push(code);
		}
		//endregion

		//region Initialize "idDelta" array
		const idDelta = [];

		for(let i = 0; i < segCount; i++)
		{
			const code = stream.getInt16();
			idDelta.push(code);
		}
		//endregion

		//region Initialize "idRangeOffset" array
		const idRangeTableOffset = stream._start;

		const idRangeOffset = [];

		for(let i = 0; i < segCount; i++)
		{
			const code = stream.getUint16();
			idRangeOffset.push(code);
		}
		//endregion

		//region Combine all segment's data and calculate glyph's indexes
		const segments = [];

		for(let i = 0; i < segCount; i++)
		{
			//region Initial variables
			const codeToGID = new Map();
			const gidToCode = new Map();

			const start = startCode[i];
			const end = endCode[i];
			const offset = idRangeTableOffset + (i * 2);

			let rangeStream = null;
			if(idRangeOffset[i])
			{
				rangeStream = new SeqStream({
					stream: stream.stream.slice(
						offset + idRangeOffset[i],
						offset + idRangeOffset[i] + ((end - start) << 1) + 2)
				});
			}
			//endregion
			
			for(let j = start; j <= end; j++)
			{
				let glyphIndex = 0;

				if(idRangeOffset[i])
				{
					const value = rangeStream.getUint16();
					glyphIndex = (value + idDelta[i]) & 0xFFFF;
				}
				else
					glyphIndex = (j + idDelta[i]) & 0xFFFF;

				codeToGID.set(j, glyphIndex);
				gidToCode.set(glyphIndex, j);
			}

			segments.push({
				codeToGID,
				gidToCode,
				delta: idDelta[i],
				offset: idRangeOffset[i],
			});
		}
		//endregion

		return new Format4({
			language,
			segments
		});
	}
	//**********************************************************************************
	/**
	 * Make Format4 table directly from array of code points
	 *
	 * @param {number} language
	 * @param {Array} glyphs Array of glyphs. !!! MUST BE WITH "MISSING" AND "NULL" GLYPHS !!!
	 * @param {number} [platformID=3]
	 * @param {number} [platformSpecificID=1]
	 */
	static fromGlyphs(language, glyphs, platformID = 3, platformSpecificID = 1)
	{
		//region Initial variables
		const codeToGID = new Map();

		const segments = [];
		//endregion

		//region Fill map (!!! FIRST TWO GLYPHS MUST BE "MISSING" AND "NULL" GLYPHS !!!)
		for(let i = 2; i < glyphs.length; i++)
		{
			for(const unicode of glyphs[i].unicodes)
				codeToGID.set(unicode, i);
		}
		//endregion

		//region Divide map to correct regions
		const codeToGIDArray = Array.from(codeToGID).sort((a, b) => (a[0] - b[0]));

		let segment = {
			codeToGID: new Map(),
			gidToCode: new Map()
		};

		let prevCode = codeToGIDArray[0][0] - 1;

		for(let i = 0; i < codeToGIDArray.length; i++)
		{
			if(codeToGIDArray[i][0] > (prevCode + 1))
			{
				segments.push(segment);

				segment = {
					codeToGID: new Map([codeToGIDArray[i]]),
					gidToCode: new Map([[codeToGIDArray[i][1], codeToGIDArray[i][0]]])
				};
			}
			else
			{
				segment.codeToGID.set(codeToGIDArray[i][0], codeToGIDArray[i][1]);
				segment.gidToCode.set(codeToGIDArray[i][1], codeToGIDArray[i][0]);
			}

			prevCode = codeToGIDArray[i][0];
		}

		segments.push(segment);
		//endregion

		//region Append specific segment for "missingGlyph"
		segments.push({
			codeToGID: new Map([[0xFFFF, 0]]),
			gidToCode: new Map([[0, 0xFFFF]]),
		});
		//endregion

		return new Format4({
			language,
			segments,
			platformID,
			platformSpecificID
		});
	}
	//**********************************************************************************
	/**
	 * Return GID by character code
	 *
	 * @param {number} code Character code
	 * @return {number|null}
	 */
	gid(code)
	{
		// Replace absent chars via GID = 0 (as it is required by standard)
		let result = 0;

		for(const segment of this.segments)
		{
			result = segment.codeToGID.get(code);
			if(typeof result !== "undefined")
				break;
		}

		return (result || 0);
	}
	//**********************************************************************************
	/**
	 * Return character code by GID
	 *
	 * @param {number} gid Glyph index (GID)
	 * @return {Array}
	 */
	code(gid)
	{
		let result = [];

		for(const segment of this.segments)
		{
			const segmentResult = segment.gidToCode.get(gid);
			if(typeof segmentResult !== "undefined")
				result.push(segmentResult);
		}

		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
export class Format6 extends CMAPSubTable
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		this.language = parameters.language || 0;
		this.firstCode = parameters.firstCode || 0;
		this.glyphIndexArray = parameters.glyphIndexArray || [];
	}
	//**********************************************************************************
	static get className()
	{
		return "Format6";
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
		stream.appendUint16(6); // CMAP format
		stream.appendUint16(10 + (2 * this.glyphIndexArray.length));
		stream.appendUint16(this.language);
		stream.appendUint16(this.firstCode);
		stream.appendUint16(this.glyphIndexArray.length);

		for(const glyphIndex of this.glyphIndexArray)
			stream.appendUint16(glyphIndex);

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
		const length = stream.getUint16();

		const language = stream.getUint16();
		const firstCode = stream.getUint16();
		const entryCount = stream.getUint16();

		const glyphIndexArray = [];

		for(let j = 0; j < entryCount; j++)
		{
			const glyphIndex = stream.getUint16();
			glyphIndexArray.push(glyphIndex);
		}

		return new Format6({
			language,
			firstCode,
			glyphIndexArray
		});
	}
	//**********************************************************************************
	/**
	 * Make Format6 table directly from array of glyphs
	 *
	 * @param {number} language
	 * @param {Array} glyphs Array of glyphs
	 * @param {number} [firstCode=32]
	 * @param {number} [platformID=3]
	 * @param {number} [platformSpecificID=1]
	 */
	static fromGlyphs(language, glyphs, firstCode = 32, platformID = 3, platformSpecificID = 1)
	{
		const glyphIndexArray = [];

		for(let i = 0; i < glyphs.length; i++)
			glyphIndexArray.push(i);

		return new Format6({
			language,
			firstCode,
			glyphIndexArray,
			platformID,
			platformSpecificID
		});
	}
	//**********************************************************************************
	/**
	 * Return GID by character code
	 *
	 * @param {number} code Character code
	 * @return {number|null}
	 */
	gid(code)
	{
		let result = 0;

		for(let i = 0; i < this.glyphIndexArray.length; i++)
		{
			if((this.firstCode + i) === code)
			{
				result = this.glyphIndexArray[i];
				break;
			}
		}

		return result;
	}
	//**********************************************************************************
	/**
	 * Return character code by GID
	 *
	 * @param {number} gid Glyph index (GID)
	 * @return {Array}
	 */
	code(gid)
	{
		switch(true)
		{
			case ((gid > (this.glyphIndexArray.length - 1)) && (gid < 0)):
				return [];
			case ((gid === 0) || (gid === 1)):
				return [65535];
			default:
		}

		return [this.firstCode + gid - 2]; // First GID belongs to "missing glyph", second is "null glyph"
	}
	//**********************************************************************************
}
//**************************************************************************************
export class Format0 extends CMAPSubTable
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		this.language = parameters.language || 0;
		this.glyphIndexArray = parameters.glyphIndexArray || [];
	}
	//**********************************************************************************
	static get className()
	{
		return "Format0";
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
		stream.appendUint16(0); // CMAP format
		stream.appendUint16(262);
		stream.appendUint16(this.language);

		stream.appendView(new Uint8Array(this.glyphIndexArray));

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
		const length = stream.getUint16();
		const language = stream.getUint16();

		const glyphIndexArray = [];

		for(let j = 0; j < 256; j++)
		{
			const glyphIndex = (stream.getBlock(1))[0];
			glyphIndexArray.push(glyphIndex);
		}

		return new Format0({
			language,
			glyphIndexArray
		});
	}
	//**********************************************************************************
	/**
	 * Make Format0 table directly from array of code points
	 *
	 * @param {number} language
	 * @param {Array} glyphs Array of glyphs
	 */
	static fromGlyphs(language, glyphs)
	{
		return new Format0();
	}
	//**********************************************************************************
}
//**************************************************************************************
export class Format12 extends CMAPSubTable
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		this.language = parameters.language || 0;
		this.groups = parameters.groups || [];

		this.codeToGID = parameters.codeToGID || new Map();
		this.gidToCode = parameters.gidToCode || new Map();
	}
	//**********************************************************************************
	static get className()
	{
		return "Format12";
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
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
		const codeToGID = new Map();
		const gidToCode = new Map();
		//endregion

		//region Read major information
		const reserved = stream.getUint16();
		const length = stream.getUint32();
		const language = stream.getUint32();
		const numGroups = stream.getUint32();
		//endregion

		//region Read information about groups
		for(let i = 0; i < numGroups; i++)
		{
			const startCharCode = stream.getUint32();
			const endCharCode = stream.getUint32();
			let startGlyphID = stream.getUint32();

			for(let j = startCharCode; j <= endCharCode; j++, startGlyphID++)
			{
				let code = gidToCode.get(startGlyphID);
				if(typeof code === "undefined")
					code = [];

				code.push(j);

				gidToCode.set(startGlyphID, code);

				let glyph = codeToGID.get(j);
				if(typeof glyph === "undefined")
					glyph = [];

				glyph.push(startGlyphID);

				codeToGID.set(j, glyph);
			}
		}
		//endregion

		return new Format12({
			language,
			gidToCode,
			codeToGID
		});
	}
	//**********************************************************************************
	/**
	 * Return GID by character code
	 *
	 * @param {number} code Character code
	 * @return {number|null}
	 */
	gid(code)
	{
		return (this.codeToGID.get(code) || 0);
	}
	//**********************************************************************************
	/**
	 * Return character code by GID
	 *
	 * @param {number} gid Glyph index (GID)
	 * @return {Array}
	 */
	code(gid)
	{
		return (this.gidToCode.get(gid) || []);
	}
	//**********************************************************************************
}
//**************************************************************************************
export class Format14 extends CMAPSubTable
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		this.varSelectorRecords = parameters.varSelectorRecords || [];
	}
	//**********************************************************************************
	static get className()
	{
		return "Format14";
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
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
		//region Read major information
		const length = stream.getUint32();
		const numVarSelectorRecords = stream.getUint32();
		//endregion

		//region Read "varSelectorRecords" array
		const varSelectorRecords = [];

		for(let i = 0; i < numVarSelectorRecords; i++)
		{
			//region Initial variables
			const varSelectorRecord = {};
			//endregion

			//region Read header
			varSelectorRecord.varSelector = stream.getUint24();
			varSelectorRecord.defaultUVSOffset = stream.getUint32();
			varSelectorRecord.nonDefaultUVSOffset = stream.getUint32();
			//endregion

			//region Read "default UVS"
			if(varSelectorRecord.defaultUVSOffset)
			{
				varSelectorRecord.defaultUVSRecords = [];

				const defaultUVSStream = new SeqStream({ stream: stream.stream.slice(varSelectorRecord.defaultUVSOffset) });

				const numUnicodeValueRanges = defaultUVSStream.getUint32();

				for(let j = 0; j < numUnicodeValueRanges; j++)
				{
					const defaultUVS = {};

					defaultUVS.startUnicodeValue = defaultUVSStream.getUint24();
					defaultUVS.additionalCount = (defaultUVSStream.getBlock(1))[0];

					varSelectorRecord.defaultUVSRecords.push(defaultUVS);
				}
			}
			//endregion

			//region Read "non-default UVS"
			if(varSelectorRecord.nonDefaultUVSOffset)
			{
				varSelectorRecord.nonDefaultUVSRecords = [];

				const nonDefaultUVSStream = new SeqStream({ stream: stream.stream.slice(varSelectorRecord.nonDefaultUVSOffset) });

				const numUVSMappings = nonDefaultUVSStream.getUint32();

				for(let j = 0; j < numUVSMappings; j++)
				{
					const uvsMapping = {};

					uvsMapping.unicodeValue = nonDefaultUVSStream.getUint24();
					uvsMapping.glyphID = nonDefaultUVSStream.getUint16();

					varSelectorRecord.nonDefaultUVSRecords.push(uvsMapping);
				}
			}
			//endregion

			varSelectorRecords.push(varSelectorRecord);
		}
		//endregion

		return new Format14({
			varSelectorRecords
		});
	}
	//**********************************************************************************
}
//**************************************************************************************
