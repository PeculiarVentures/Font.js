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
			const length = subTableStream.getUint16();

			let subTable = { format };

			if(length)
			{
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
					default:
					//throw new Error(`Unknow CMAP subtable format - ${format}`);
				}

				//region Set upper lever subtable-specific information
				subTable.platformID = subTables[i].platformID;
				subTable.platformSpecificID = subTables[i].platformSpecificID;
				//endregion

				subTables[i] = subTable;
			}
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
		let result = null;
		
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
				information.delta = (segment.codeToGID.get(information.start) - information.start) & 0xFFFF;
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
		const language = stream.getUint16();
		const segCountX2 = stream.getUint16();
		const segCount = segCountX2 >> 1;
		stream.getUint16(); // searchRange
		stream.getUint16(); // entrySelector
		stream.getUint16(); // rangeShift
		//endregion

		//region Initialize "endCode" array
		const endCode = [];

		for(let i = 0; i < segCount; i++)
		{
			const code = stream.getUint16();
			endCode.push(code);
		}
		//endregion

		stream.getUint16(); // reservedPad

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
					// noinspection JSObjectNullOrUndefined,JSUnresolvedFunction
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
	 * Return GID by character code
	 *
	 * @param {number} code Character code
	 * @return {?number}
	 */
	gid(code)
	{
		let result = null;

		for(const segment of this.segments)
		{
			result = segment.codeToGID.get(code);
			if(typeof result !== "undefined")
				break;
		}

		return (result || null);
	}
	//**********************************************************************************
	/**
	 * Return character code by GID
	 *
	 * @param {number} gid Glyph index (GID)
	 * @return {number|null}
	 */
	code(gid)
	{
		let result = null;

		for(const segment of this.segments)
		{
			result = segment.gidToCode.get(gid);
			if(typeof result !== "undefined")
				break;
		}

		return (result || null);
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
	 * Return GID by character code
	 *
	 * @param {number} code Character code
	 * @return {number|null}
	 */
	gid(code)
	{
		let result = null;

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
}
//**************************************************************************************
