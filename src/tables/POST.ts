import { SeqStream } from "bytestreamjs";
import { FontTable } from "../Table";

// Standard names
// https://developer.apple.com/fonts/TrueType-Reference-Manual/RM06/Chap6post.html
//
const standardNames = [
	".notdef",
	".null",
	"nonmarkingreturn",
	"space",
	"exclam",
	"quotedbl",
	"numbersign",
	"dollar",
	"percent",
	"ampersand",
	"quotesingle",
	"parenleft",
	"parenright",
	"asterisk",
	"plus",
	"comma",
	"hyphen",
	"period",
	"slash",
	"zero",
	"one",
	"two",
	"three",
	"four",
	"five",
	"six",
	"seven",
	"eight",
	"nine",
	"colon",
	"semicolon",
	"less",
	"equal",
	"greater",
	"question",
	"at",
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
	"O",
	"P",
	"Q",
	"R",
	"S",
	"T",
	"U",
	"V",
	"W",
	"X",
	"Y",
	"Z",
	"bracketleft",
	"backslash",
	"bracketright",
	"asciicircum",
	"underscore",
	"grave",
	"a",
	"b",
	"c",
	"d",
	"e",
	"f",
	"g",
	"h",
	"i",
	"j",
	"k",
	"l",
	"m",
	"n",
	"o",
	"p",
	"q",
	"r",
	"s",
	"t",
	"u",
	"v",
	"w",
	"x",
	"y",
	"z",
	"braceleft",
	"bar",
	"braceright",
	"asciitilde",
	"Adieresis",
	"Aring",
	"Ccedilla",
	"Eacute",
	"Ntilde",
	"Odieresis",
	"Udieresis",
	"aacute",
	"agrave",
	"acircumflex",
	"adieresis",
	"atilde",
	"aring",
	"ccedilla",
	"eacute",
	"egrave",
	"ecircumflex",
	"edieresis",
	"iacute",
	"igrave",
	"icircumflex",
	"idieresis",
	"ntilde",
	"oacute",
	"ograve",
	"ocircumflex",
	"odieresis",
	"otilde",
	"uacute",
	"ugrave",
	"ucircumflex",
	"udieresis",
	"dagger",
	"degree",
	"cent",
	"sterling",
	"section",
	"bullet",
	"paragraph",
	"germandbls",
	"registered",
	"copyright",
	"trademark",
	"acute",
	"dieresis",
	"notequal",
	"AE",
	"Oslash",
	"infinity",
	"plusminus",
	"lessequal",
	"greaterequal",
	"yen",
	"mu",
	"partialdiff",
	"summation",
	"product",
	"pi",
	"integral",
	"ordfeminine",
	"ordmasculine",
	"Omega",
	"ae",
	"oslash",
	"questiondown",
	"exclamdown",
	"logicalnot",
	"radical",
	"florin",
	"approxequal",
	"Delta",
	"guillemotleft",
	"guillemotright",
	"ellipsis",
	"nonbreakingspace",
	"Agrave",
	"Atilde",
	"Otilde",
	"OE",
	"oe",
	"endash",
	"emdash",
	"quotedblleft",
	"quotedblright",
	"quoteleft",
	"quoteright",
	"divide",
	"lozenge",
	"ydieresis",
	"Ydieresis",
	"fraction",
	"currency",
	"guilsinglleft",
	"guilsinglright",
	"fi",
	"fl",
	"daggerdbl",
	"periodcentered",
	"quotesinglbase",
	"quotedblbase",
	"perthousand",
	"Acircumflex",
	"Ecircumflex",
	"Aacute",
	"Edieresis",
	"Egrave",
	"Iacute",
	"Icircumflex",
	"Idieresis",
	"Igrave",
	"Oacute",
	"Ocircumflex",
	"apple",
	"Ograve",
	"Uacute",
	"Ucircumflex",
	"Ugrave",
	"dotlessi",
	"circumflex",
	"tilde",
	"macron",
	"breve",
	"dotaccent",
	"ring",
	"cedilla",
	"hungarumlaut",
	"ogonek",
	"caron",
	"Lslash",
	"lslash",
	"Scaron",
	"scaron",
	"Zcaron",
	"zcaron",
	"brokenbar",
	"Eth",
	"eth",
	"Yacute",
	"yacute",
	"Thorn",
	"thorn",
	"minus",
	"multiply",
	"onesuperior",
	"twosuperior",
	"threesuperior",
	"onehalf",
	"onequarter",
	"threequarters",
	"franc",
	"Gbreve",
	"gbreve",
	"Idotaccent",
	"Scedilla",
	"scedilla",
	"Cacute",
	"cacute",
	"Ccaron",
	"ccaron",
	"dcroat"
];

export interface POSTParameters {
	version?: number;
	italicAngle?: number;
	underlinePosition?: number;
	underlineThickness?: number;
	isFixedPitch?: number;
	minMemType42?: number;
	maxMemType42?: number;
	minMemType1?: number;
	maxMemType1?: number;
	glyphNameIndex?: number[];
	names?: Uint8Array[];
	mappedNames?: string[];
	numberOfGlyphs?: number;
}

export class POST extends FontTable { // TODO Split into versions
	version: number;
	italicAngle: number;
	underlinePosition: number;
	underlineThickness: number;
	isFixedPitch: number;
	minMemType42: number;
	maxMemType42: number;
	minMemType1: number;
	maxMemType1: number;
	glyphNameIndex?: number[];
	names?: Uint8Array[];
	mappedNames?: string[];

	constructor(parameters: POSTParameters = {}) {
		super();

		this.version = parameters.version || 0x00010000;
		this.italicAngle = parameters.italicAngle || 0;
		this.underlinePosition = parameters.underlinePosition || 0;
		this.underlineThickness = parameters.underlineThickness || 0;
		this.isFixedPitch = parameters.isFixedPitch || 0;
		this.minMemType42 = parameters.minMemType42 || 0;
		this.maxMemType42 = parameters.maxMemType42 || 0;
		this.minMemType1 = parameters.minMemType1 || 0;
		this.maxMemType1 = parameters.maxMemType1 || 0;

		if (this.version === 0x00020000) {
			this.glyphNameIndex = parameters.glyphNameIndex || [];
			this.names = parameters.names || [];

			this.mappedNames = parameters.mappedNames || [];
		}
	}

	static get tag() {
		return 0x706F7374;
	}

	public toStream(stream: SeqStream): boolean {
		stream.appendUint32(this.version);
		stream.appendUint32(this.italicAngle);
		stream.appendInt16(this.underlinePosition);
		stream.appendInt16(this.underlineThickness);
		stream.appendUint32(this.isFixedPitch);
		stream.appendUint32(this.minMemType42);
		stream.appendUint32(this.maxMemType42);
		stream.appendUint32(this.minMemType1);
		stream.appendUint32(this.maxMemType1);

		if (this.version === 0x00020000) {
			stream.appendUint16(this.glyphNameIndex!.length);

			if (this.glyphNameIndex!.length) {
				for (const index of this.glyphNameIndex!)
					stream.appendUint16(index);

				for (const name of this.names!) {
					stream.appendView(new Uint8Array([name.length]));
					stream.appendView(new Uint8Array(name));
				}
			}
		}

		return true;
	}

	public static fromStream(stream: SeqStream): POST {
		//#region Initial variables
		const parameters: POSTParameters = {};
		//#endregion

		//#region Parse major parameters
		parameters.version = stream.getUint32();
		parameters.italicAngle = stream.getUint32();
		parameters.underlinePosition = stream.getInt16();
		parameters.underlineThickness = stream.getInt16();
		parameters.isFixedPitch = stream.getUint32();
		parameters.minMemType42 = stream.getUint32();
		parameters.maxMemType42 = stream.getUint32();
		parameters.minMemType1 = stream.getUint32();
		parameters.maxMemType1 = stream.getUint32();
		//#endregion

		//#region Parse parameters specific "version = 2"
		if (parameters.version === 0x00020000) {
			parameters.numberOfGlyphs = stream.getUint16();

			parameters.glyphNameIndex = [];

			for (let i = 0; i < parameters.numberOfGlyphs; i++) {
				const value = stream.getUint16();
				parameters.glyphNameIndex.push(value);
			}

			parameters.names = [];
			parameters.mappedNames = [];

			for (let i = 0; i < parameters.numberOfGlyphs; i++) {
				const length = (stream.getBlock(1))[0];
				const value = stream.getBlock(length);

				parameters.names.push(value);

				//#region Make a mapping of POST names to real glyph indexes and names
				if (parameters.glyphNameIndex[i] < standardNames.length)
					parameters.mappedNames.push(standardNames[parameters.glyphNameIndex[i]]);
				else
					parameters.mappedNames.push(String.fromCodePoint(...parameters.names[parameters.glyphNameIndex[i] - standardNames.length]));
				//#endregion
			}
		}
		//#endregion

		return new POST(parameters);
	}

}

