import { SeqStream } from "../../bytestreamjs/bytestream.js";
import { BaseClass } from "../BaseClass.js";
//**************************************************************************************
export class ClassDefTable extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.glyphToClass = parameters.glyphToClass || new Map();
		this.classToGlyph = parameters.classToGlyph || new Map();
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
		const parameters = {
			glyphToClass: new Map(),
			classToGlyph: new Map()
		};

		parameters.classFormat = stream.getUint16();

		switch(parameters.classFormat)
		{
			case 1:
				{
					let startGlyphID = stream.getUint16();
					const glyphCount = stream.getUint16();

					for(let i = 0; i < glyphCount; i++, startGlyphID++)
					{
						const classValue = stream.getUint16();

						parameters.glyphToClass.set(startGlyphID, classValue);

						let glyphs = parameters.classToGlyph.get(classValue);
						if(typeof glyphs === "undefined")
							glyphs = [];

						glyphs.push(startGlyphID);

						parameters.classToGlyph.set(classValue, glyphs);
					}
				}

				break;
			case 2:
				{
					const classRangeCount = stream.getUint16();

					for(let i = 0; i < classRangeCount; i++)
					{
						const startGlyphID = stream.getUint16();
						const endGlyphID = stream.getUint16();
						const glyphClass = stream.getUint16();

						for(let j = startGlyphID; j <= endGlyphID; j++)
						{
							parameters.glyphToClass.set(j, glyphClass);

							let glyphs = parameters.classToGlyph.get(glyphClass);
							if(typeof glyphs === "undefined")
								glyphs = [];

							glyphs.push(j);

							parameters.classToGlyph.set(glyphClass, glyphs);
						}
					}
				}

				break;
			default:
				return new ClassDefTable({});
		}

		return new ClassDefTable(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
export class CoverageTable extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();
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
		const parameters = {};

		parameters.coverageFormat = stream.getUint16();

		switch(parameters.coverageFormat)
		{
			case 1:
				{
					parameters.glyphCount = stream.getUint16();
					parameters.glyphArray = [];

					for(let i = 0; i < parameters.glyphCount; i++)
					{
						const glyph = stream.getUint16();
						parameters.glyphArray.push(glyph);
					}
				}

				break;
			case 2:
				{
					parameters.rangeCount = stream.getUint16();
					parameters.rangeRecords = [];

					for(let i = 0; i < parameters.rangeCount; i++)
					{
						const rangeRecord = {};

						rangeRecord.startGlyphID = stream.getUint16();
						rangeRecord.endGlyphID = stream.getUint16();
						rangeRecord.startCoverageIndex = stream.getUint16();

						parameters.rangeRecords.push(rangeRecord);
					}
				}

				break;
			default:
				return new CoverageTable({});
		}

		return new CoverageTable(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
export class AttachListTable extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.coverageTable = parameters.coverageTable || new CoverageTable({});
		this.attachPoints = parameters.attachPoints || [];
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
		const parameters = { attachPoints: [] };

		const coverageOffset = stream.getUint16();
		if(coverageOffset)
			parameters.coverageTable = CoverageTable.fromStream(new SeqStream({ stream: stream.stream.slice(coverageOffset) }));

		const glyphCount = stream.getUint16();

		for(let i = 0; i < glyphCount; i++)
		{
			const attachPointOffset = stream.getUint16();
			const attachPointStream = new SeqStream({ stream: stream.stream.slice(attachPointOffset) });

			const attachPoint = { pointIndices: [] };

			attachPoint.pointCount = attachPointStream.getUint16();

			for(let j = 0; j < attachPoint.pointCount; j++)
			{
				const pointIndex = attachPointStream.getUint16();
				attachPoint.pointIndices.push(pointIndex);
			}

			parameters.attachPoints.push(attachPoint);
		}

		return new AttachListTable(parameters)
	}
	//**********************************************************************************
}
//**************************************************************************************
export class LigCaretListTable extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();
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
		const parameters = {};

		parameters.coverageOffset = stream.getUint16();
		parameters.ligGlyphCount = stream.getUint16();
		parameters.ligGlyphOffsets = [];

		for(let i = 0; i < parameters.ligGlyphCount; i++)
		{
			const ligGlyphOffset = stream.getUint16();
			parameters.ligGlyphOffsets.push(ligGlyphOffset);
		}

		return new LigCaretListTable(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
export class GDEF extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x47444546;
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
		//region Initial variables
		const parameters = {};
		//endregion

		//region Read a standard header information for v1.0
		parameters.majorVersion = stream.getUint16();
		parameters.minorVersion = stream.getUint16();

		const glyphClassDefOffset = stream.getUint16();
		if(glyphClassDefOffset)
			parameters.glyphClassDef = ClassDefTable.fromStream(new SeqStream({ stream: stream.stream.slice(glyphClassDefOffset) }));

		const attachListOffset = stream.getUint16();
		if(attachListOffset)
			parameters.attachList = AttachListTable.fromStream(new SeqStream({ stream: stream.stream.slice(attachListOffset) }));

		const ligCaretListOffset = stream.getUint16();
		if(ligCaretListOffset)
			parameters.ligCaretList = LigCaretListTable.fromStream(new SeqStream({ stream: stream.stream.slice(ligCaretListOffset) }));

		parameters.markAttachClassDefOffset = stream.getUint16();
		//endregion

		//region Read additiona data specific for each version
		switch(true)
		{
			case ((parameters.majorVersion === 1) && (parameters.minorVersion === 0)):
				break;
			case ((parameters.majorVersion === 1) && (parameters.minorVersion === 2)):
				parameters.markGlyphSetsDefOffset = stream.getUint16();
				break;
			case ((parameters.majorVersion === 1) && (parameters.minorVersion === 3)):
				parameters.markGlyphSetsDefOffset = stream.getUint16();
				parameters.itemVarStoreOffset = stream.getUint16();
				break;
			default:
				return new GDEF({}); // Unknown version of header
		}
		//endregion

		return new GDEF(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
