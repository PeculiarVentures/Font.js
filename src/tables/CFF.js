import { SeqStream } from "../../bytestreamjs/bytestream.js";
import { BaseClass } from "../BaseClass.js";
//**************************************************************************************
export const StandardStrings = [
	".notdef", "space", "exclam", "quotedbl", "numbersign", "dollar", "percent", "ampersand", "quoteright",
	"parenleft", "parenright", "asterisk", "plus", "comma", "hyphen", "period", "slash", "zero", "one", "two",
	"three", "four", "five", "six", "seven", "eight", "nine", "colon", "semicolon", "less", "equal", "greater",
	"question", "at", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S",
	"T", "U", "V", "W", "X", "Y", "Z", "bracketleft", "backslash", "bracketright", "asciicircum", "underscore",
	"quoteleft", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
	"u", "v", "w", "x", "y", "z", "braceleft", "bar", "braceright", "asciitilde", "exclamdown", "cent", "sterling",
	"fraction", "yen", "florin", "section", "currency", "quotesingle", "quotedblleft", "guillemotleft",
	"guilsinglleft", "guilsinglright", "fi", "fl", "endash", "dagger", "daggerdbl", "periodcentered", "paragraph",
	"bullet", "quotesinglbase", "quotedblbase", "quotedblright", "guillemotright", "ellipsis", "perthousand",
	"questiondown", "grave", "acute", "circumflex", "tilde", "macron", "breve", "dotaccent", "dieresis", "ring",
	"cedilla", "hungarumlaut", "ogonek", "caron", "emdash", "AE", "ordfeminine", "Lslash", "Oslash", "OE",
	"ordmasculine", "ae", "dotlessi", "lslash", "oslash", "oe", "germandbls", "onesuperior", "logicalnot", "mu",
	"trademark", "Eth", "onehalf", "plusminus", "Thorn", "onequarter", "divide", "brokenbar", "degree", "thorn",
	"threequarters", "twosuperior", "registered", "minus", "eth", "multiply", "threesuperior", "copyright",
	"Aacute", "Acircumflex", "Adieresis", "Agrave", "Aring", "Atilde", "Ccedilla", "Eacute", "Ecircumflex",
	"Edieresis", "Egrave", "Iacute", "Icircumflex", "Idieresis", "Igrave", "Ntilde", "Oacute", "Ocircumflex",
	"Odieresis", "Ograve", "Otilde", "Scaron", "Uacute", "Ucircumflex", "Udieresis", "Ugrave", "Yacute",
	"Ydieresis", "Zcaron", "aacute", "acircumflex", "adieresis", "agrave", "aring", "atilde", "ccedilla", "eacute",
	"ecircumflex", "edieresis", "egrave", "iacute", "icircumflex", "idieresis", "igrave", "ntilde", "oacute",
	"ocircumflex", "odieresis", "ograve", "otilde", "scaron", "uacute", "ucircumflex", "udieresis", "ugrave",
	"yacute", "ydieresis", "zcaron", "exclamsmall", "Hungarumlautsmall", "dollaroldstyle", "dollarsuperior",
	"ampersandsmall", "Acutesmall", "parenleftsuperior", "parenrightsuperior", "266 ff", "onedotenleader",
	"zerooldstyle", "oneoldstyle", "twooldstyle", "threeoldstyle", "fouroldstyle", "fiveoldstyle", "sixoldstyle",
	"sevenoldstyle", "eightoldstyle", "nineoldstyle", "commasuperior", "threequartersemdash", "periodsuperior",
	"questionsmall", "asuperior", "bsuperior", "centsuperior", "dsuperior", "esuperior", "isuperior", "lsuperior",
	"msuperior", "nsuperior", "osuperior", "rsuperior", "ssuperior", "tsuperior", "ff", "ffi", "ffl",
	"parenleftinferior", "parenrightinferior", "Circumflexsmall", "hyphensuperior", "Gravesmall", "Asmall",
	"Bsmall", "Csmall", "Dsmall", "Esmall", "Fsmall", "Gsmall", "Hsmall", "Ismall", "Jsmall", "Ksmall", "Lsmall",
	"Msmall", "Nsmall", "Osmall", "Psmall", "Qsmall", "Rsmall", "Ssmall", "Tsmall", "Usmall", "Vsmall", "Wsmall",
	"Xsmall", "Ysmall", "Zsmall", "colonmonetary", "onefitted", "rupiah", "Tildesmall", "exclamdownsmall",
	"centoldstyle", "Lslashsmall", "Scaronsmall", "Zcaronsmall", "Dieresissmall", "Brevesmall", "Caronsmall",
	"Dotaccentsmall", "Macronsmall", "figuredash", "hypheninferior", "Ogoneksmall", "Ringsmall", "Cedillasmall",
	"questiondownsmall", "oneeighth", "threeeighths", "fiveeighths", "seveneighths", "onethird", "twothirds",
	"zerosuperior", "foursuperior", "fivesuperior", "sixsuperior", "sevensuperior", "eightsuperior", "ninesuperior",
	"zeroinferior", "oneinferior", "twoinferior", "threeinferior", "fourinferior", "fiveinferior", "sixinferior",
	"seveninferior", "eightinferior", "nineinferior", "centinferior", "dollarinferior", "periodinferior",
	"commainferior", "Agravesmall", "Aacutesmall", "Acircumflexsmall", "Atildesmall", "Adieresissmall",
	"Aringsmall", "AEsmall", "Ccedillasmall", "Egravesmall", "Eacutesmall", "Ecircumflexsmall", "Edieresissmall",
	"Igravesmall", "Iacutesmall", "Icircumflexsmall", "Idieresissmall", "Ethsmall", "Ntildesmall", "Ogravesmall",
	"Oacutesmall", "Ocircumflexsmall", "Otildesmall", "Odieresissmall", "OEsmall", "Oslashsmall", "Ugravesmall",
	"Uacutesmall", "Ucircumflexsmall", "Udieresissmall", "Yacutesmall", "Thornsmall", "Ydieresissmall", "001.000",
	"001.001", "001.002", "001.003", "Black", "Bold", "Book", "Light", "Medium", "Regular", "Roman", "Semibold"];
//**************************************************************************************
export class INDEX extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters)

		/**
		 * Array of ArrayBuffer values having related data
		 * @type {[ArrayBuffer]}
		 */
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
	static fromStream(stream, version = 1)
	{
		//region Read INDEX header values
		let count = 0;

		switch(version)
		{
			case 1:
				count = stream.getUint16();
				break;
			default:
				count = stream.getUint32();
		}

		const offSize = (stream.getBlock(1))[0];
		//endregion

		//region Read offsets to data values
		const offsets = [];

		for(let i = 0; i <= count; i++)
		{
			let offset = null;

			switch(offSize)
			{
				case 1:
					offset = (stream.getBlock(1))[0];
					break;
				case 2:
					offset = stream.getUint16();
					break;
				case 3:
					offset = stream.getUint24();
					break;
				case 4:
					offset = stream.getUint32();
					break;
				default:
			}

			if(offset !== null)
				offsets.push(offset);
		}
		//endregion

		//region Read data values
		const data = [];

		for(let i = 0; i < (offsets.length - 1); i++)
		{
			const value = stream.stream._buffer.slice(stream.start - 1 + offsets[i], stream.start - 1 + offsets[i + 1]);
			data.push(value);
		}
		//endregion

		//region Move stream to correct position
		stream.start = stream.start - 1 + offsets[offsets.length - 1];
		//endregion

		return new INDEX({ data });
	}
	//**********************************************************************************
}
//**************************************************************************************
export class StringIndex extends INDEX
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);
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
	static fromStream(stream, version = 1)
	{
		const index = INDEX.fromStream(stream, version);

		const data = Array.from(index.data, element => String.fromCharCode(...new Uint8Array(element)));

		return new StringIndex({ data });
	}
	//**********************************************************************************
}
//**************************************************************************************
export class DICT
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		this.entries = parameters.entries || [];
	}
	//**********************************************************************************
	/**
	 * Convert current object to ArrayBuffer data
	 *
	 * @returns {boolean} Result of the function
	 */
	toBuffer()
	{
		return true;
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
		//region Initial variables
		const view = new DataView(buffer);

		const entries = [];
		let values = [];
		let current = 0;
		//endregion

		while(current < buffer.byteLength)
		{
			let value = null;

			const b0 = view.getUint8(current);
			current++;

			switch(true)
			{
				case (b0 <= 27):
					{
						let key = b0;

						if(key === 12)
						{
							key = 1200 + view.getUint8(current);
							current++;
						}

						entries.push({ key, values });
						values = [];
					}

					break;
				case (b0 === 28):
					{
						const b1 = view.getUint8(current);
						current++;
						const b2 = view.getUint8(current);
						current++;

						value = (b1 << 8 | b2);
					}

					break;
				case (b0 === 29):
					{
						const b1 = view.getUint8(current);
						current++;
						const b2 = view.getUint8(current);
						current++;
						const b3 = view.getUint8(current);
						current++;
						const b4 = view.getUint8(current);
						current++;

						value = (b1 << 24 | b2 << 16 | b3 << 8 | b4);
					}

					break;
				case (b0 === 30):
					{
						const represents = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "E", "E-", "", "-"];

						let real = "";

						while(true)
						{
							const nibbles = view.getUint8(current);
							current++;

							const n1 = nibbles >> 4;
							if(n1 === 0xF)
								break;

							real += represents[n1];

							const n2 = nibbles & 0xF;
							if(n2 === 0xF)
								break;

							real += represents[n2];
						}

						value = parseFloat(real);
					}

					break;
				case ((b0 >= 32) && (b0 <= 246)):
					value = (b0 - 139);
					break;
				case ((b0 >= 247) && (b0 <= 250)):
					{
						const b1 = view.getUint8(current);
						current++;

						value = ((b0 - 247) * 256 + b1 + 108);
					}

					break;
				case ((b0 >= 251) && (b0 <= 254)):
					{
						const b1 = view.getUint8(current);
						current++;

						value = (-(b0 - 251) * 256 - b1 - 108);
					}

					break;
				default:
			}

			if(value !== null)
				values.push(value);
		}

		return new DICT({ entries });
	}
	//**********************************************************************************
}
//**************************************************************************************
class CFFTopDICT extends DICT
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		if("version" in parameters)
			this.version = parameters.version;
		if("Notice" in parameters)
			this.Notice = parameters.Notice;
		if("Copyright" in parameters)
			this.Copyright = parameters.Copyright;
		if("FullName" in parameters)
			this.FullName = parameters.FullName;
		if("FamilyName" in parameters)
			this.FamilyName = parameters.FamilyName;
		if("Weight" in parameters)
			this.Weight = parameters.Weight;

		this.isFixedPitch = parameters.isFixedPitch || false;
		this.ItalicAngle = parameters.ItalicAngle || 0;
		this.UnderlinePosition = parameters.UnderlinePosition || (-100);
		this.UnderlineThickness = parameters.UnderlineThickness || 50;
		this.PaintType = parameters.PaintType || 0;
		this.CharstringType = parameters.CharstringType || 2;
		this.FontMatrix = parameters.FontMatrix || [0.001, 0, 0, 0.001, 0, 0];

		if("UniqueID" in parameters)
			this.UniqueID = parameters.UniqueID;

		this.FontBBox = parameters.FontBBox || [0, 0, 0, 0];
		this.StrokeWidth = parameters.StrokeWidth || 0;

		if("XUID" in parameters)
			this.XUID = parameters.XUID;

		this.charset = parameters.charset || 0;
		this.Encoding = parameters.Encoding || 0;

		if("CharStrings" in parameters)
			this.CharStrings = parameters.CharStrings;
		if("Private" in parameters)
			this.Private = parameters.Private;
		if("SyntheticBase" in parameters)
			this.SyntheticBase = parameters.SyntheticBase;
		if("PostScript" in parameters)
			this.PostScript = parameters.PostScript;
		if("BaseFontName" in parameters)
			this.BaseFontName = parameters.BaseFontName;
		if("BaseFontBlend" in parameters)
			this.BaseFontBlend = parameters.BaseFontBlend;
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
	 * @param {!StringIndex} stringIndex
	 *
	 * @returns {*} Result of the function
	 */
	static fromBuffer(buffer, stringIndex)
	{
		const dict = DICT.fromBuffer(buffer);

		const parameters = { entries: dict.entries };

		for(const entry of dict.entries)
		{
			switch(entry.key)
			{
				case 0:
					parameters.version = (entry.values[0] <= 390) ? StandardStrings[entry.values[0]] : stringIndex.data[entry.values[0] - 391];
					break;
				case 1:
					parameters.Notice = (entry.values[0] <= 390) ? StandardStrings[entry.values[0]] : stringIndex.data[entry.values[0] - 391];
					break;
				case 1200:
					parameters.Copyright = (entry.values[0] <= 390) ? StandardStrings[entry.values[0]] : stringIndex.data[entry.values[0] - 391];
					break;
				case 2:
					parameters.FullName = (entry.values[0] <= 390) ? StandardStrings[entry.values[0]] : stringIndex.data[entry.values[0] - 391];
					break;
				case 3:
					parameters.FamilyName = (entry.values[0] <= 390) ? StandardStrings[entry.values[0]] : stringIndex.data[entry.values[0] - 391];
					break;
				case 4:
					parameters.Weight = (entry.values[0] <= 390) ? StandardStrings[entry.values[0]] : stringIndex.data[entry.values[0] - 391];
					break;
				case 1201:
					parameters.isFixedPitch = !!(entry.values[0]);
					break;
				case 1202:
					parameters.ItalicAngle = entry.values[0];
					break;
				case 1203:
					parameters.UnderlinePosition = entry.values[0];
					break;
				case 1204:
					parameters.UnderlineThickness = entry.values[0];
					break;
				case 1205:
					parameters.PaintType = entry.values[0];
					break;
				case 1206:
					parameters.CharstringType = entry.values[0];
					break;
				case 1207:
					parameters.FontMatrix = entry.values;
					break;
				case 13:
					parameters.UniqueID = entry.values[0];
					break;
				case 5:
					parameters.FontBBox = entry.values;
					break;
				case 1208:
					parameters.StrokeWidth = entry.values[0];
					break;
				case 14:
					parameters.XUID = entry.values;
					break;
				case 15:
					parameters.charset = entry.values[0];
					break;
				case 16:
					parameters.Encoding = entry.values[0];
					break;
				case 17:
					parameters.CharStrings = entry.values[0];
					break;
				case 18:
					parameters.Private = {
						size: entry.values[0],
						offset: entry.values[1]
					};
					break;
				case 1220:
					parameters.SyntheticBase = entry.values[0];
					break;
				case 1221:
					parameters.PostScript = (entry.values[0] <= 390) ? StandardStrings[entry.values[0]] : stringIndex.data[entry.values[0] - 391];
					break;
				case 1222:
					parameters.BaseFontName = (entry.values[0] <= 390) ? StandardStrings[entry.values[0]] : stringIndex.data[entry.values[0] - 391];
					break;
				case 1223:
					parameters.BaseFontBlend = entry.values; // TODO: inspect situation with "delta" type
					break;
				default:
			}
		}

		return new CFFTopDICT(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
class CFFPrivateDICT extends DICT
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

		this.ForceBold = parameters.ForceBold || false;
		this.LanguageGroup = parameters.LanguageGroup || 0;
		this.ExpansionFactor = parameters.ExpansionFactor || 0.06;
		this.initialRandomSeed = parameters.initialRandomSeed || 0;

		if("Subrs" in parameters)
			this.Subrs = parameters.Subrs;

		this.defaultWidthX = parameters.defaultWidthX || 0;
		this.nominalWidthX = parameters.nominalWidthX || 0;
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
				case 1214:
					parameters.ForceBold = !!(entry.values[0]);
					break;
				case 1217:
					parameters.LanguageGroup = entry.values[0];
					break;
				case 1218:
					parameters.ExpansionFactor = entry.values[0];
					break;
				case 1219:
					parameters.initialRandomSeed = entry.values[0];
					break;
				case 19:
					parameters.Subrs = entry.values[0];
					break;
				case 20:
					parameters.defaultWidthX = entry.values[0];
					break;
				case 21:
					parameters.nominalWidthX = entry.values[0];
					break;
				default:
			}
		}

		return new CFFPrivateDICT(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
class CFFCharset extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		this.format = parameters.format || 0;

		if("charset" in parameters)
			this.charset = parameters.charset;
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
	 * @param {!number} numGlyphs
	 * @param {!StringIndex} stringIndex
	 *
	 * @returns {*} Result of the function
	 */
	static fromStream(stream, numGlyphs, stringIndex)
	{
		const parameters = { charset: [".notdef"] };

		parameters.format = (stream.getBlock(1))[0];

		switch(parameters.format)
		{
			case 0:
				{
					for(let i = 0; i < (numGlyphs - 1); i++)
					{
						const value = stream.getUint16();
						parameters.charset.push((value <= 390) ? StandardStrings[value] : stringIndex.data[value - 391]);
					}
				}
				break;
			case 1:
				{
					while(parameters.charset.length <= (numGlyphs - 1))
					{
						let value = stream.getUint16();
						const count = (stream.getBlock(1))[0];

						for(let j = 0; j <= count; j++, value++)
							parameters.charset.push((value <= 390) ? StandardStrings[value] : stringIndex.data[value - 391]);
					}
				}
				break;
			case 2:
				{
					while(parameters.charset.length <= (numGlyphs - 1))
					{
						let value = stream.getUint16();
						const count = stream.getUint16();

						for(let j = 0; j <= count; j++, value++)
							parameters.charset.push((value <= 390) ? StandardStrings[value] : stringIndex.data[value - 391]);
					}
				}
				break;
			default:
		}

		return new CFFCharset(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
class CFFEncoding extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		this.format = parameters.format || 0;
		this.encoding = parameters.encoding || {};
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
		const parameters = { encoding: {} };

		parameters.format = (stream.getBlock(1))[0];

		switch(parameters.format)
		{
			case 0:
				{
					const nCodes = (stream.getBlock(1))[0];

					for(let i = 0; i < nCodes; i++)
					{
						const code = (stream.getBlock(1))[0];
						parameters.encoding[code] = i;
					}
				}

				break;
			case 1:
				{
					const nRanges = (stream.getBlock(1))[0];

					for(let i = 0; i < nRanges; i++)
					{
						const first = (stream.getBlock(1))[0];
						const nLeft = (stream.getBlock(1))[0];

						for(let j = first, code = 1; j <= (first + nLeft); j++, code++)
							parameters.encoding[j] = code;
					}
				}

				break;
			default:
		}

		return new CFFEncoding(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
export class CFF extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.dicts = parameters.dicts || [];
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x43464620;
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
		//region Read header information
		const headerBlock = stream.getBlock(4);

		const header = {
			major: headerBlock[0],
			minor: headerBlock[1],
			hdrSize: headerBlock[2],
			offSize: headerBlock[3]
		};
		//endregion

		//region Read possible "extension bytes"
		stream.getBlock(header.hdrSize - 4);
		//endregion

		//region Read "Name INDEX"
		const nameIndex = INDEX.fromStream(stream);
		//endregion
		
		//region Read "Top DICT INDEX"
		const topDICTIndex = INDEX.fromStream(stream);
		//endregion

		//region Read "String INDEX"
		const stringIndex = StringIndex.fromStream(stream);
		//endregion

		//region Read "Global Subr INDEX"
		const globalSubrIndex = INDEX.fromStream(stream);
		//endregion

		//region Parse "Top DICT"
		const dicts = [];

		for(const data of topDICTIndex.data)
		{
			const dict = CFFTopDICT.fromBuffer(data, stringIndex);

			if("Private" in dict)
			{
				const buffer = stream.stream._buffer.slice(dict.Private.offset, dict.Private.offset + dict.Private.size);
				dict.PrivateDICT = CFFPrivateDICT.fromBuffer(buffer);
			}

			if("CharStrings" in dict)
			{
				dict.CharStringsINDEX = INDEX.fromStream(new SeqStream({stream: stream.stream.slice(dict.CharStrings)}));
				dict.CharsetParsed = CFFCharset.fromStream(
					new SeqStream({ stream: stream.stream.slice(dict.charset) }),
					dict.CharStringsINDEX.data.length,
					stringIndex
				);

				switch(dict.Encoding)
				{
					case 0:
						break;
					case 1:
						break;
					case 2:
						dict.EncodingParsed = CFFEncoding.fromStream(new SeqStream({ stream: stream.stream.slice(dict.Encoding) }));
						break;
					default:
				}
			}

			dicts.push(dict);
		}
		//endregion

		return new CFF({ dicts });
	}
	//**********************************************************************************
}
//**************************************************************************************
