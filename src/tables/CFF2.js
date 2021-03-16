import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass.js";
import { INDEX, DICT } from "./CFF.js";
import { getF2Dot14 } from "../common.js";
//**************************************************************************************
export class CFF2TopDICT extends DICT
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		this.FontMatrix = parameters.FontMatrix || [0.001, 0, 0, 0.001, 0, 0];

		if("CharStrings" in parameters)
			this.CharStrings = parameters.CharStrings;
		if("FDArray" in parameters)
			this.FDArray = parameters.FDArray;
		if("FDSelect" in parameters)
			this.FDSelect = parameters.FDSelect;
		if("vstore" in parameters)
			this.vstore = parameters.vstore;
	}
	//**********************************************************************************
	/**
	 * Convert current object to ArrayBuffer data
	 *
	 * @returns {boolean} Result of the function
	 */
	toBuffer()
	{
		return super.toBuffer();
	}
	//**********************************************************************************
	/**
	 * Convert ArrayBuffer data to object
	 *
	 * @param {!ArrayBuffer} buffer
	 *
	 * @returns {*} Result of the function
	 */
	static fromBuffer(buffer)
	{
		const dict = DICT.fromBuffer(buffer);

		const parameters = { entries: dict.entries };

		for(const entry of dict.entries)
		{
			switch(entry.key)
			{
				case 1207:
					parameters.FontMatrix = entry.values;
					break;
				case 17:
					parameters.CharStrings = entry.values[0];
					break;
				case 1236:
					parameters.FDArray = entry.values[0];
					break;
				case 1237:
					parameters.FDSelect = entry.values[0];
					break;
				case 24:
					parameters.vstore = entry.values[0];
					break;
				default:
			}
		}

		return new CFF2TopDICT(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
export class CFF2PrivateDICT extends DICT
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		if("BlueValues" in parameters)
			this.BlueValues = parameters.BlueValues;
		if("OtherBlues" in parameters)
			this.OtherBlues = parameters.OtherBlues;
		if("FamilyBlues" in parameters)
			this.FamilyBlues = parameters.FamilyBlues;
		if("FamilyOtherBlues" in parameters)
			this.FamilyOtherBlues = parameters.FamilyOtherBlues;

		this.BlueScale = parameters.BlueScale || 0.039625;
		this.BlueShift = parameters.BlueShift || 7;
		this.BlueFuzz = parameters.BlueFuzz || 1;

		if("StdHW" in parameters)
			this.StdHW = parameters.StdHW;
		if("StdVW" in parameters)
			this.StdVW = parameters.StdVW;
		if("SteamSnapH" in parameters)
			this.SteamSnapH = parameters.SteamSnapH;
		if("SteamSnapV" in parameters)
			this.SteamSnapV = parameters.SteamSnapV;

		this.LanguageGroup = parameters.LanguageGroup || 0;
		this.ExpansionFactor = parameters.ExpansionFactor || 0.06;
		this.vsindex = parameters.vsindex || 0;

		if("blend" in parameters)
			this.blend = parameters.blend;
		if("Subrs" in parameters)
			this.Subrs = parameters.Subrs;
		if("SubrsINDEX" in parameters)
			this.SubrsINDEX = parameters.SubrsINDEX;
	}
	//**********************************************************************************
	/**
	 * Convert current object to ArrayBuffer data
	 *
	 * @returns {boolean} Result of the function
	 */
	toBuffer()
	{
		return super.toBuffer();
	}
	//**********************************************************************************
	/**
	 * Convert ArrayBuffer data to object
	 *
	 * @param {!ArrayBuffer} buffer
	 *
	 * @returns {*} Result of the function
	 */
	static fromBuffer(buffer)
	{
		const dict = DICT.fromBuffer(buffer);

		const parameters = { entries: dict.entries };

		for(const entry of dict.entries)
		{
			if(entry.values.length === 0)
				continue;

			switch(entry.key)
			{
				case 6:
					parameters.BlueValues = entry.values;
					break;
				case 7:
					parameters.OtherBlues = entry.values;
					break;
				case 8:
					parameters.FamilyBlues = entry.values;
					break;
				case 9:
					parameters.FamilyOtherBlues = entry.values;
					break;
				case 1209:
					parameters.BlueScale = entry.values[0];
					break;
				case 1210:
					parameters.BlueShift = entry.values[0];
					break;
				case 1211:
					parameters.BlueFuzz = entry.values[0];
					break;
				case 10:
					parameters.StdHW = entry.values[0];
					break;
				case 11:
					parameters.StdVW = entry.values[0];
					break;
				case 1212:
					parameters.SteamSnapH = entry.values;
					break;
				case 1213:
					parameters.SteamSnapV = entry.values;
					break;
				case 1217:
					parameters.LanguageGroup = entry.values[0];
					break;
				case 1218:
					parameters.ExpansionFactor = entry.values[0];
					break;
				case 19:
					parameters.Subrs = entry.values[0];
					break;
				case 22:
					parameters.vsindex = entry.values[0];
					break;
				case 23:
					parameters.blend = entry.values[0];
					break;
				default:
			}
		}

		return new CFF2PrivateDICT(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
export class CFF2FDSelect extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		this.format = parameters.format || 0;
		this.fds = parameters.fds || [];
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
	 *
	 * @param {!SeqStream} stream
	 * @param {!number} nGlyphs
	 *
	 * @returns {*} Result of the function
	 */
	static fromStream(stream, nGlyphs)
	{
		//region Initial variables
		const parameters = { fds: [] };
		//endregion

		//region Read infomration about format
		parameters.format = (stream.getBlock(1))[0];
		//endregion

		switch(parameters.format)
		{
			case 0:
				parameters.fds = stream.getBlock(nGlyphs);
				break;
			case 3:
				{
					//region Read information about ranges
					const nRanges = stream.getUint16();
					const range3 = [];

					for(let i = 0; i < nRanges; i++)
					{
						const range = {};

						range.first = stream.getUint16();
						range.fd = (stream.getBlock(1))[0];

						range3.push(range);
					}

					const sentinel = stream.getUint16();
					//endregion

					//region Transform ranges to FD information
					for(let i = 0; i < (range3.length - 1); i++)
					{
						for(let j = range3[i].first; j < range3[i + 1].first; j++)
							parameters.fds[j] = range3[i].fd;
					}

					for(let j = range3[range3.length - 1].first; j < sentinel; j++)
						parameters.fds[j] = range3[range3.length - 1].fd;
					//endregion
				}

				break;
			case 4:
				{
					//region Read information about ranges
					const nRanges = stream.getUint32();
					const range4 = [];

					for(let i = 0; i < nRanges; i++)
					{
						const range = {};

						range.first = stream.getUint32();
						range.fd = stream.getUint16();

						range4.push(range);
					}

					const sentinel = stream.getUint32();
					//endregion

					//region Transform ranges to FD information
					for(let i = 0; i < (range4.length - 1); i++)
					{
						for(let j = range4[i].first; j < range4[i + 1].first; j++)
							parameters.fds[j] = range4[i].fd;
					}

					for(let j = range4[range4.length - 1].first; j < sentinel; j++)
						parameters.fds[j] = range4[range4.length - 1].fd;
					//endregion
				}

				break;
			default:
		}

		return new CFF2FDSelect(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
export class ItemVariationStore extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		this.format = parameters.format || 1;
		this.itemVariationDataSubtables = parameters.itemVariationDataSubtables || [];
		this.variationRegionList = parameters.variationRegionList || {};
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
	 *
	 * @param {!SeqStream} stream
	 *
	 * @returns {*} Result of the function
	 */
	static fromStream(stream)
	{
		const parameters = {};

		parameters.format = stream.getUint16();

		switch(parameters.format)
		{
			case 1:
				{
					const variationRegionListOffset = stream.getUint32();
					const itemVariationDataOffsets = [];

					const itemVariationDataCount = stream.getUint16();

					for(let i = 0; i < itemVariationDataCount; i++)
					{
						const offset = stream.getUint32();
						itemVariationDataOffsets.push(offset);
					}

					parameters.itemVariationDataSubtables = [];

					for(const offset of itemVariationDataOffsets)
					{
						stream.start = offset;

						const subtable = {};

						subtable.itemCount = stream.getUint16();
						subtable.shortDeltaCount = stream.getUint16();
						subtable.regionIndexCount = stream.getUint16();
						subtable.regionIndexes = [];

						for(let i = 0; i < subtable.regionIndexCount; i++)
						{
							const index = stream.getUint16();
							subtable.regionIndexes.push(index);
						}

						subtable.deltaSets = [];

						for(let i = 0; i < subtable.itemCount; i++)
						{
							const set = [];

							for(let j = 0; j < subtable.shortDeltaCount; j++)
							{
								const value = stream.getInt16();
								set.push(value);
							}

							for(let j = 0; j < (subtable.regionIndexCount - subtable.shortDeltaCount); j++)
							{
								const value = (stream.getBlock(1))[0];
								const int8 = (Int8Array.from([value]))[0];

								set.push(int8);
							}

							subtable.deltaSets.push(set);
						}

						parameters.itemVariationDataSubtables.push(subtable);
					}

					//region Parse "VariationRegionList"
					stream.start = variationRegionListOffset;

					parameters.variationRegionList = {};

					parameters.variationRegionList.axisCount = stream.getUint16();
					parameters.variationRegionList.regionCount = stream.getUint16();
					parameters.variationRegionList.variationRegions = [];

					for(let i = 0; i < parameters.variationRegionList.regionCount; i++)
					{
						const regionAxes = [];

						for(let j = 0; j < parameters.variationRegionList.axisCount; j++)
						{
							const record = {};

							record.startCoord = getF2Dot14(stream);
							record.peakCoord = getF2Dot14(stream);
							record.endCoord = getF2Dot14(stream);

							regionAxes.push(record);
						}

						parameters.variationRegionList.variationRegions.push(regionAxes);
					}
					//endregion
				}

				break;
			default:
		}

		return new ItemVariationStore(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
export class VariationStoreData extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.itemVariationStore = parameters.itemVariationStore || new ItemVariationStore();
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
	 *
	 * @param {!SeqStream} stream
	 *
	 * @returns {*} Result of the function
	 */
	static fromStream(stream)
	{
		const parameters = {};

		const length = stream.getUint16();
		parameters.itemVariationStore = ItemVariationStore.fromStream(new SeqStream({ stream: stream.stream.slice(stream.start, stream.start + length) }));

		return new VariationStoreData(parameters)
	}
	//**********************************************************************************
}
//**************************************************************************************
export class CFF2CharstringINDEX extends INDEX
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		this.data = parameters.data || [];
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
	 *
	 * @param {!SeqStream} stream
	 * @param {?number} [version=1]
	 *
	 * @returns {*} Result of the function
	 */
	static fromStream(stream)
	{
		//region Initial variables
		const parameters = { data: [] };
		let stack = [];
		//endregion

		//region Decode main INDEX values
		const index = INDEX.fromStream(stream, 2);
		//endregion

		//region Decode each charstring
		for(const data of index.data)
		{
			const view = new DataView(data);

			for(let i = 0; i < view.byteLength; i++)
			{
				let code = view.getUint8(i);

				switch(true)
				{
					case (code === 1): // hstem
						{
							parameters.data.push({
								operator: "hstem",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 3): // vstem
						{
							parameters.data.push({
								operator: "vstem",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 4): // vmoveto
						{
							parameters.data.push({
								operator: "vmoveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 5): // rlineto
						{
							parameters.data.push({
								operator: "rlineto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 6): // hlineto
						{
							parameters.data.push({
								operator: "hlineto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 7): // vlineto
						{
							parameters.data.push({
								operator: "vlineto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 8): // rrcurveto
						{
							parameters.data.push({
								operator: "rrcurveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 10): // callsubr
						{
							parameters.data.push({
								operator: "callsubr",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 12): // escape
						{
							i++;
							code = view.getUint8(i);

							switch(true)
							{
								case ((code >= 0) && (code <= 33)): // reserved
									break;
								case (code === 34): // hflex
									{
										parameters.data.push({
											operator: "hflex",
											operands: stack
										});

										stack = [];
									}

									break;
								case (code === 35): // flex
									{
										parameters.data.push({
											operator: "flex",
											operands: stack
										});

										stack = [];
									}

									break;
								case (code === 36): // hflex1
									{
										parameters.data.push({
											operator: "hflex1",
											operands: stack
										});

										stack = [];
									}

									break;
								case (code === 37): // flex1
									{
										parameters.data.push({
											operator: "flex1",
											operands: stack
										});

										stack = [];
									}

									break;
								case ((code >= 38) && (code <= 255)): // reserved
									break;
								default:
							}
						}

						break;
					case (code === 15): // vsindex
						{
							parameters.data.push({
								operator: "vsindex",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 16): // blend
						{
							parameters.data.push({
								operator: "blend",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 18): // hstemhm
						{
							parameters.data.push({
								operator: "hstemhm",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 19): // hintmask
						{
							parameters.data.push({
								operator: "hintmask",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 20): // cntrmask
						{
							parameters.data.push({
								operator: "cntrmask",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 21): // rmoveto
						{
							parameters.data.push({
								operator: "rmoveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 22): // hmoveto
						{
							parameters.data.push({
								operator: "hmoveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 23): // vstemhm
						{
							parameters.data.push({
								operator: "vstemhm",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 24): // rcurveline
						{
							parameters.data.push({
								operator: "rcurveline",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 25): // rlinecurve
						{
							parameters.data.push({
								operator: "rlinecurve",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 26): // vvcurveto
						{
							parameters.data.push({
								operator: "vvcurveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 27): // hhcurveto
						{
							parameters.data.push({
								operator: "hhcurveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 28): // <numbers>
						{
							i++;
							const code2 = view.getUint8(i);

							stack.push(((code << 24) | (code2 << 16)) >> 16);
						}

						break;
					case (code === 29): // callgsubr
						{
							parameters.data.push({
								operator: "callgsubr",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 30): // vhcurveto
						{
							parameters.data.push({
								operator: "vhcurveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 31): // hvcurveto
						{
							parameters.data.push({
								operator: "hvcurveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case ((code >= 32) && (code <= 246)):
						stack.push(code - 139);
						break;
					case ((code >= 247) && (code <= 250)):
						{
							i++;
							const code2 = view.getUint8(i);

							stack.push((code - 247) * 256 + code2 + 108);
						}

						break;
					case ((code >= 251) && (code <= 254)):
						{
							i++;
							const code2 = view.getUint8(i);

							stack.push(-((code - 251) * 256) - code2 - 108);
						}

						break;
					case (code === 255):
						{
							i++;

							code = view.getInt32(i, false);
							stack.push(code / 65536);

							i += 4;
						}

						break;
					default:
				}
			}
		}
		//endregion

		return new CFF2CharstringINDEX(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
export class CFF2 extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x43464632;
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

		//region Read header information
		const headerBlock = stream.getBlock(3);

		const header = {
			majorVersion: headerBlock[0],
			minorVersion: headerBlock[1],
			headerSize: headerBlock[2]
		};
		header.topDictLength = stream.getUint16();
		//endregion

		//region Read possible "extension bytes"
		stream.getBlock(header.headerSize - 5);
		//endregion

		//region Parse "Top DICT"
		parameters.topDICT = CFF2TopDICT.fromBuffer(stream.stream._buffer.slice(stream.start, stream.start + header.topDictLength));
		//endregion

		//region Parse "Global Subr" index
		stream.start = stream.start + header.topDictLength;

		parameters.globalSubrINDEX = INDEX.fromStream(stream, header.majorVersion);
		//endregion

		if("CharStrings" in parameters.topDICT)
			parameters.CharStringsINDEX = CFF2CharstringINDEX.fromStream(new SeqStream({stream: stream.stream.slice(parameters.topDICT.CharStrings)}));

		if("FDArray" in parameters.topDICT)
		{
			parameters.FDArrayINDEX = INDEX.fromStream(new SeqStream({stream: stream.stream.slice(parameters.topDICT.FDArray)}), header.majorVersion);
			parameters.PrivateDICTs = [];

			for(const data of parameters.FDArrayINDEX.data)
			{
				const dict = DICT.fromBuffer(data);

				for(const entry of dict.entries)
				{
					switch(entry.key)
					{
						case 18:
							{
								const dict = CFF2PrivateDICT.fromBuffer(stream.stream._buffer.slice(entry.values[1], entry.values[1] + entry.values[0]));
								if("Subrs" in dict)
									dict.SubrsINDEX = CFF2CharstringINDEX.fromStream(new SeqStream({ stream: stream.stream.slice(entry.values[1] + dict.Subrs) }));

								parameters.PrivateDICTs.push(dict);
							}

							break;
						default:
					}
				}
			}
		}

		if("FDSelect" in parameters.topDICT)
		{
			if("CharStringsINDEX" in parameters)
			{
				parameters.FDSelect = CFF2FDSelect.fromStream(
					new SeqStream({stream: stream.stream.slice(parameters.topDICT.FDSelect)}),
					parameters.CharStringsINDEX.data.length
				);
			}
		}

		if("vstore" in parameters.topDICT)
			parameters.VariationStoreData = VariationStoreData.fromStream(new SeqStream({ stream: stream.stream.slice(parameters.topDICT.vstore) }));

		return new CFF2(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
