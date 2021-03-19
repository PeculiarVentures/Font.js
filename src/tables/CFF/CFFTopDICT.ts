import { CFFCharset } from "./CFFCharset";
import { CFFEncoding } from "./CFFEncoding";
import { CFFPrivateDICT } from "./CFFPrivateDICT";
import { DICTParameters, DICT } from "./DICT";
import { INDEX } from "./IDX";
import { StandardStrings } from "./StandardStrings";
import { StringIndex } from "./StringIndex";

export interface CFFTopDICTPrivate {
	size: number;
	offset: number;
}

export interface CFFTopDICTParameters extends DICTParameters {
	version?: string;
	Notice?: string;
	Copyright?: string;
	FullName?: string;
	FamilyName?: string;
	Weight?: string;
	isFixedPitch?: boolean;
	ItalicAngle?: number;
	UnderlinePosition?: number;
	UnderlineThickness?: number;
	PaintType?: number;
	CharstringType?: number;
	FontMatrix?: number[];
	UniqueID?: number;
	FontBBox?: number[];
	StrokeWidth?: number;
	XUID?: number[];
	charset?: number;
	Encoding?: number;
	CharStrings?: number;
	Private?: CFFTopDICTPrivate;
	SyntheticBase?: number;
	PostScript?: string;
	BaseFontName?: string;
	BaseFontBlend?: number[];
}

export class CFFTopDICT extends DICT {
	public version?: string;
	public Notice?: string;
	public Copyright?: string;
	public FullName?: string;
	public FamilyName?: string;
	public Weight?: string;
	public isFixedPitch: boolean;
	public ItalicAngle: number;
	public UnderlinePosition: number;
	public UnderlineThickness: number;
	public PaintType: number;
	public CharstringType: number;
	public FontMatrix: number[];
	public UniqueID?: number;
	public FontBBox: number[];
	public StrokeWidth: number;
	public XUID?: number[];
	public charset: number;
	public Encoding: number;
	public CharStrings?: number;
	public Private?: CFFTopDICTPrivate;
	public SyntheticBase?: number;
	public PostScript?: string;
	public BaseFontName?: string;
	public BaseFontBlend?: number[];

	public PrivateDICT?: CFFPrivateDICT;
	public CharStringsINDEX?: INDEX;
	public CharsetParsed?: CFFCharset;
	public EncodingParsed?: CFFEncoding;

	constructor(parameters: CFFTopDICTParameters = {}) {
		super(parameters);

		if ("version" in parameters) {
			this.version = parameters.version;
		}
		if ("Notice" in parameters) {
			this.Notice = parameters.Notice;
		}
		if ("Copyright" in parameters) {
			this.Copyright = parameters.Copyright;
		}
		if ("FullName" in parameters) {
			this.FullName = parameters.FullName;
		}
		if ("FamilyName" in parameters) {
			this.FamilyName = parameters.FamilyName;
		}
		if ("Weight" in parameters) {
			this.Weight = parameters.Weight;
		}

		this.isFixedPitch = parameters.isFixedPitch || false;
		this.ItalicAngle = parameters.ItalicAngle || 0;
		this.UnderlinePosition = parameters.UnderlinePosition || (-100);
		this.UnderlineThickness = parameters.UnderlineThickness || 50;
		this.PaintType = parameters.PaintType || 0;
		this.CharstringType = parameters.CharstringType || 2;
		this.FontMatrix = parameters.FontMatrix || [0.001, 0, 0, 0.001, 0, 0];

		if ("UniqueID" in parameters) {
			this.UniqueID = parameters.UniqueID;
		}

		this.FontBBox = parameters.FontBBox || [0, 0, 0, 0];
		this.StrokeWidth = parameters.StrokeWidth || 0;

		if ("XUID" in parameters) {
			this.XUID = parameters.XUID;
		}

		this.charset = parameters.charset || 0;
		this.Encoding = parameters.Encoding || 0;

		if ("CharStrings" in parameters) {
			this.CharStrings = parameters.CharStrings;
		}
		if ("Private" in parameters) {
			this.Private = parameters.Private;
		}
		if ("SyntheticBase" in parameters) {
			this.SyntheticBase = parameters.SyntheticBase;
		}
		if ("PostScript" in parameters) {
			this.PostScript = parameters.PostScript;
		}
		if ("BaseFontName" in parameters) {
			this.BaseFontName = parameters.BaseFontName;
		}
		if ("BaseFontBlend" in parameters) {
			this.BaseFontBlend = parameters.BaseFontBlend;
		}
	}

	/**
	 * Convert ArrayBuffer data to object
	 *
	 * @param buffer
	 * @param stringIndex
	 *
	 * @returns Result of the function
	 */
	static fromBuffer(buffer: ArrayBuffer, stringIndex: StringIndex = new StringIndex()): CFFTopDICT {
		const dict = DICT.fromBuffer(buffer);

		const parameters: CFFTopDICTParameters = { entries: dict.entries };

		for (const entry of dict.entries) {
			switch (entry.key) {
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

}