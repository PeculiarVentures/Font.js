import { SeqStream } from "bytestreamjs";
import { unicodePointsToCodePoints, stringToCodePoints } from "./common";
import { BaseClass } from "./BaseClass";
import * as Tables from "./tables";
import { Glyph, GlyphMap, missingGlyph, nullGlyph } from "./tables";

export enum ScalerTypes {
	true = 0x74727565,
	x00010000 = 0x00010000,
	typ1 = 0x74797031,
	OTTO = 0x4F54544F,
}

/**
 * Calculating checksum for most tables
 */
function calculateCheckSum(buffer: ArrayBuffer): number {
	//#region Initial variables
	const bufferView = new Uint8Array(buffer);

	const paddedBuffer = new ArrayBuffer(buffer.byteLength + (4 - (buffer.byteLength % 4)));
	const paddedView = new Uint8Array(paddedBuffer);
	paddedView.set(bufferView, 0);

	const dataView = new DataView(paddedBuffer);
	//#endregion

	//#region Calculate checksum
	const sum = new Uint32Array([0]);

	for (let i = 0; i < dataView.byteLength; i += 4) {
		sum[0] += dataView.getUint32(i);
	}
	//#endregion

	return sum[0];
}

interface FONTValues {
	missingGlyph?: Tables.Glyph;
	nullGlyph?: Tables.SimpleGlyph;
	ascent?: number;
	descent?: number;
	lineGap?: number;
	unitsPerEm?: number;
}

export interface FontSubsetParameters {
	fontValues: FONTValues;
	glyphIndexes: number[];
	cmaps: Tables.CMAPType[];
	cmapLanguage: number;
	tables?: Map<number, BaseClass>;
}

export interface FontTTFParameters {
	fontValues: FONTValues;
	glyphs: Glyph[];
	cmapFormat: number;
	cmapLanguage: number;
	tables?: Map<number, BaseClass>;
}

export interface FontParameters {
	scalerType?: ScalerTypes;
	searchRange?: number;
	entrySelector?: number;
	rangeShift?: number;
	tables?: Map<any, any>;
	warnings?: string[];
}


export class Font extends BaseClass {
	public scalerType: ScalerTypes;
	public searchRange: number;
	public entrySelector: number;
	public rangeShift: number;
	public tables: Map<any, any>;
	public warnings: string[];

	private _glyphs?: Tables.Glyph[];

	constructor(parameters: FontParameters = {}) {
		super();

		this.scalerType = parameters.scalerType || ScalerTypes.OTTO;
		this.searchRange = parameters.searchRange || 0;
		this.entrySelector = parameters.entrySelector || 0;
		this.rangeShift = parameters.rangeShift || 0;
		this.tables = parameters.tables || new Map();

		this.warnings = parameters.warnings || [];
	}

	public findUnicodeGlyphsMap(): GlyphMap | null {
		const cmap: Tables.CMAP = this.tables.get(Tables.CMAP.tag);

		// find unicode table (platform 0 or platform 3-1 or 3-10)
		const tableUnicodeFormat = cmap.subTables.find(table =>
			table.platformID === 0
			|| (table.platformID === 3 && (table.platformSpecificID === 1 || table.platformSpecificID === 10)));

		if (!tableUnicodeFormat) {
			return null;
		}

		return tableUnicodeFormat.getGlyphMap();
	}

	/**
	 * Returns glyph by letter or unicode
	 * @param value One letter or unicode
	 */
	public findUnicodeGlyph(value: string | number): Tables.Glyph | null {
		const map = this.findUnicodeGlyphsMap();
		if (!map) {
			return null;
		}

		// check value on type
		let unicode: number;
		if (typeof value === "string") {
			if (value.length !== 1) {
				throw new Error("Letter must be one");
			}
			unicode = value.charCodeAt(0);
		} else {
			unicode = value;
		}

		// find glyph from map
		const indexGlyph = map.get(unicode);
		if (!indexGlyph) {
			return null;
		}

		const glyph = this.glyphs.find(g => g.index === indexGlyph);

		return glyph || null;
	}

	public toStream(stream: SeqStream, streamOffset = 0): boolean {
		//#region Initial variables
		let tablesData = new Map();

		const fontStream = new SeqStream();
		//#endregion

		//#region Encode tables data
		const encodeTable = (table: BaseClass) => { // TODO Would it be better to add TableClass -> BaseClass
			//#region Common encoding
			const tableStream = new SeqStream();

			const tableResult = table.toStream(tableStream);
			if (tableResult !== true)
				throw new Error(`Error while processing ${(table.constructor as typeof BaseClass).className}`);
			//#endregion

			//#region Special additional encoding
			// TODO Remove comments. 'tag' field must present in all tables
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			switch ((table.constructor as typeof BaseClass).tag) {
				case Tables.GLYF.tag:
					{
						const glyf = table as Tables.GLYF;

						//#region Calculate "indexToLocFormat" value
						let indexToLocFormat = 0;

						for (const element of glyf.loca!) {
							if ((element > 0xFFFF) || (element % 2)) {
								indexToLocFormat = 1;
								break;
							}
						}
						//#endregion

						//#region Initialize "loca" table
						let loca = this.tables.get(Tables.LOCA.tag);
						if (!loca) {
							loca = new Tables.LOCA();
						}

						loca.offsets = glyf.loca;
						loca.indexToLocFormat = indexToLocFormat;

						this.tables.set(Tables.LOCA.tag, loca);

						encodeTable(loca);
						//#endregion

						//#region Initialize "maxp" table
						let maxp = this.tables.get(Tables.MAXP.tag);
						if (typeof maxp === "undefined")
							maxp = new Tables.MAXP();

						maxp.numGlyphs = glyf.glyphs.length;

						this.tables.set(Tables.MAXP.tag, maxp);

						encodeTable(maxp);
						//#endregion
					}

					break;
				case Tables.LOCA.tag:
					{
						const loca = table as Tables.LOCA;

						//#region Initialize "maxp" table
						let maxp = this.tables.get(Tables.MAXP.tag);
						if (!maxp) {
							maxp = new Tables.MAXP();
						}

						maxp.numGlyphs = (loca.offsets.length - 1);

						this.tables.set(Tables.MAXP.tag, maxp);

						encodeTable(maxp);
						//#endregion

						//#region Initialize "head" table
						let head = this.tables.get(Tables.HEAD.tag);
						if (typeof head === "undefined")
							head = new Tables.HEAD();

						head.indexToLocFormat = loca.indexToLocFormat;

						this.tables.set(Tables.HEAD.tag, head);

						encodeTable(head);
						//#endregion
					}

					break;
				default:
			}
			//#endregion

			// TODO Remove comments
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			tablesData.set((table.constructor as typeof BaseClass).tag, tableStream);
		};

		for (const table of this.tables.values())
			encodeTable(table);
		//#endregion

		//#region Initial variables
		let offset = 12 + (this.tables.size * 16) + streamOffset;

		const log2TablesSize = Math.floor(Math.log2(this.tables.size));
		const highestPowerOf2 = Math.pow(2, log2TablesSize);
		//#endregion

		//#region Append major "sfnt" header
		fontStream.appendUint32(this.scalerType);
		fontStream.appendUint16(this.tables.size);
		fontStream.appendUint16(highestPowerOf2 << 4);
		fontStream.appendUint16(log2TablesSize);
		fontStream.appendUint16((this.tables.size - highestPowerOf2) << 4);
		//#endregion

		//#region Encode tables header
		tablesData = new Map([...tablesData.entries()].sort((a, b) => (a[0] - b[0])));

		for (const [tag, data] of tablesData.entries()) {
			fontStream.appendUint32(tag);
			fontStream.appendUint32(calculateCheckSum(data.buffer));
			fontStream.appendUint32(offset);
			fontStream.appendUint32(data.length);

			const padding = data.length % 4;
			if (padding)
				offset += (data.length + (4 - padding));
			else
				offset += data.length;
		}
		//#endregion

		//#region Encode tables data
		let headStart = null;

		for (const [tag, data] of tablesData.entries()) {
			if (tag === Tables.HEAD.tag)
				headStart = fontStream.start;

			fontStream.appendView(new Uint8Array(data.buffer));

			const padding = data.length % 4;
			if (padding)
				fontStream.appendView(new Uint8Array(new ArrayBuffer(4 - padding)));
		}

		if (headStart === null)
			throw new Error("Missing mandatory table HEAD");
		//#endregion

		//#region Calculate "checkSumAdjustment" for "head" table and set it
		const fontStreamBuffer = fontStream.buffer;

		fontStream.start = headStart + 8;
		fontStream.appendUint32(0xB1B0AFBA - calculateCheckSum(fontStreamBuffer));
		fontStream.length = fontStreamBuffer.byteLength;
		//#endregion

		//#region Append "fontStream" to main "stream"
		stream.appendView(new Uint8Array(fontStream.buffer));
		//#endregion

		return true;
	}

	public static fromStream(stream: SeqStream): Font {
		//#region Initial variables
		const warnings: string[] = [];
		let headCheckSum = 0;

		const tableStreams = new Map<number, SeqStream>();
		//#endregion

		//#region Get head values for entire font
		const scalerType = stream.getUint32();
		const numTables = stream.getUint16();
		const searchRange = stream.getUint16();
		const entrySelector = stream.getUint16();
		const rangeShift = stream.getUint16();
		//#endregion

		//#region Get head values for each table
		for (let i = 0; i < numTables; i++) {
			const tag = stream.getUint32();
			const checkSum = stream.getUint32();
			const offset = stream.getUint32();
			const length = stream.getUint32();

			//#region Check "checkSum" value
			const tableStream = new SeqStream({ stream: stream.stream.slice(offset, offset + length) });

			if (calculateCheckSum(tableStream.buffer) !== checkSum) {
				// In case of HEAD there is more specialized procedure for checkSum calculation
				if (tag === Tables.HEAD.tag)
					headCheckSum = checkSum;
				else
					warnings.push(`Invalid checkSum for ${tag}`);
			}
			//#endregion

			tableStreams.set(tag, tableStream);
		}
		//#endregion

		//#region Parse streams for all tables
		const tables = new Map<number, BaseClass>();

		function parseTable<T extends BaseClass = BaseClass>(tag: number): T | null;
		function parseTable(tag: number): BaseClass | null { // TODO Extract function
			const tableStream = tableStreams.get(tag);
			if (typeof tableStream === "undefined")
				throw new Error(`No stream for tag ${tag}`);

			switch (tag) {
				case Tables.CMAP.tag:
					{
						let result = tables.get(Tables.CMAP.tag);
						if (!result) {
							result = Tables.CMAP.fromStream(tableStream);
							tables.set(Tables.CMAP.tag, result);
						}

						return result || null;
					}
				case Tables.HEAD.tag:
					{
						let result = tables.get(Tables.HEAD.tag);
						if (!result) {
							//#region Calculate checkSum for the HEAD table
							const headView = new DataView(tableStream.buffer);
							headView.setUint32(8, 0);

							if (calculateCheckSum(headView.buffer) !== headCheckSum)
								warnings.push(`Invalid checkSum for ${Tables.HEAD.tag} (HEAD)`);
							//#endregion

							result = Tables.HEAD.fromStream(tableStream);
							tables.set(Tables.HEAD.tag, result);

						}

						return result || null;
					}
				case Tables.HHEA.tag:
					{
						let result = tables.get(Tables.HHEA.tag);
						if (!result) {
							result = Tables.HHEA.fromStream(tableStream);
							tables.set(Tables.HHEA.tag, result);
						}

						return result || null;
					}
				case Tables.HMTX.tag:
					{
						let result = tables.get(Tables.HMTX.tag);
						if (!result) {
							const hhea = parseTable<Tables.HHEA>(Tables.HHEA.tag);
							if (!hhea) {
								throw new Error("Something went wrong while parsing 'hhea' table");
							}

							const maxp = parseTable<Tables.MAXP>(Tables.MAXP.tag);
							if (!maxp) {
								throw new Error("Something went wrong while parsing 'maxp' table");
							}

							result = Tables.HMTX.fromStream(tableStream, maxp.numGlyphs, hhea.numOfLongHorMetrics);
							tables.set(Tables.HMTX.tag, result);
						}

						return result || null;
					}
				case Tables.MAXP.tag:
					{
						let result = tables.get(Tables.MAXP.tag);
						if (!result) {
							result = Tables.MAXP.fromStream(tableStream);
							tables.set(Tables.MAXP.tag, result);
						}

						return result || null;
					}
				case Tables.LOCA.tag:
					{
						let result = tables.get(Tables.LOCA.tag);
						if (!result) {
							const maxp = parseTable<Tables.MAXP>(Tables.MAXP.tag);
							if (!maxp) {
								throw new Error("Something went wrong while parsing 'maxp' table");
							}

							const head = parseTable<Tables.HEAD>(Tables.HEAD.tag);
							if (!head) {
								throw new Error("Something went wrong while parsing 'head' table");
							}

							result = Tables.LOCA.fromStream(tableStream, head.indexToLocFormat, maxp.numGlyphs);
							tables.set(Tables.LOCA.tag, result);
						}

						return result || null;
					}
				case Tables.GLYF.tag:
					{
						let result = tables.get(Tables.GLYF.tag);
						if (!result) {
							const maxp = parseTable<Tables.MAXP>(Tables.MAXP.tag);
							if (!maxp) {
								throw new Error("Something went wrong while parsing 'maxp' table");
							}

							const loca = parseTable<Tables.LOCA>(Tables.LOCA.tag);
							if (!loca) {
								throw new Error("Something went wrong while parsing 'loca' table");
							}

							result = Tables.GLYF.fromStream(tableStream, maxp.numGlyphs, loca);
							tables.set(Tables.GLYF.tag, result);
						}

						return result || null;
					}
				case Tables.NAME.tag:
					{
						let result = tables.get(Tables.NAME.tag);
						if (!result) {
							result = Tables.NAME.fromStream(tableStream);
							tables.set(Tables.NAME.tag, result);
						}

						return result || null;
					}
				case Tables.POST.tag:
					{
						let result = tables.get(Tables.POST.tag);
						if (!result) {
							result = Tables.POST.fromStream(tableStream);
							tables.set(Tables.POST.tag, result);
						}

						return result || null;
					}
				case Tables.OS2.tag:
					{
						let result = tables.get(Tables.OS2.tag);
						if (!result) {
							result = Tables.OS2.fromStream(tableStream);
							tables.set(Tables.OS2.tag, result);
						}

						return result || null;
					}
				case Tables.CVT.tag:
					{
						let result = tables.get(Tables.CVT.tag);
						if (!result) {
							result = Tables.CVT.fromStream(tableStream);
							tables.set(Tables.CVT.tag, result);
						}

						return result || null;
					}
				case Tables.FPGM.tag:
					{
						let result = tables.get(Tables.FPGM.tag);
						if (!result) {
							result = Tables.FPGM.fromStream(tableStream);
							tables.set(Tables.FPGM.tag, result);
						}

						return result || null;
					}
				case Tables.HDMX.tag:
					{
						let result = tables.get(Tables.HDMX.tag);
						if (!result) {
							const maxp = parseTable<Tables.MAXP>(Tables.MAXP.tag);
							if (!maxp) {
								throw new Error("Something went wrong while parsing 'maxp' table");
							}

							result = Tables.HDMX.fromStream(tableStream, maxp.numGlyphs);
							tables.set(Tables.HDMX.tag, result);
						}

						return result || null;
					}
				case Tables.PREP.tag:
					{
						let result = tables.get(Tables.PREP.tag);
						if (!result) {
							result = Tables.PREP.fromStream(tableStream);
							tables.set(Tables.PREP.tag, result);
						}

						return result || null;
					}
				case Tables.DSIG.tag:
					{
						let result = tables.get(Tables.DSIG.tag);
						if (!result) {
							result = Tables.DSIG.fromStream(tableStream);
							tables.set(Tables.DSIG.tag, result);
						}

						return result || null;
					}
				case Tables.GASP.tag:
					{
						let result = tables.get(Tables.GASP.tag);
						if (!result) {
							result = Tables.GASP.fromStream(tableStream);
							tables.set(Tables.GASP.tag, result);
						}

						return result || null;
					}
				case Tables.KERN.tag:
					{
						let result = tables.get(Tables.KERN.tag);
						if (!result) {
							result = Tables.KERN.fromStream(tableStream);
							tables.set(Tables.KERN.tag, result);
						}

						return result || null;
					}
				case Tables.CFF.tag:
					{
						let result = tables.get(Tables.CFF.tag);
						if (!result) {
							result = Tables.CFF.fromStream(tableStream);
							tables.set(Tables.CFF.tag, result);
						}

						return result || null;
					}
				case Tables.CFF2.tag:
					{
						let result = tables.get(Tables.CFF2.tag);
						if (!result) {
							result = Tables.CFF2.fromStream(tableStream);
							tables.set(Tables.CFF2.tag, result);
						}

						return result || null;
					}
				case Tables.GDEF.tag:
					{
						let result = tables.get(Tables.GDEF.tag);
						if (!result) {
							result = Tables.GDEF.fromStream(tableStream);
							tables.set(Tables.GDEF.tag, result);
						}

						return result || null;
					}
				default:
				// console.log(`Invalid table tag - ${tag}`); // TODO Don't use console
				//throw new Error(`Invalid table tag - ${tag}`);
			}

			return null;
		}

		for (const tag of tableStreams.keys()) {
			parseTable(tag);
		}
		//#endregion

		return new Font({
			scalerType,
			searchRange,
			entrySelector,
			rangeShift,
			warnings,
			tables
		});
	}

	public get numGlyphs() {
		//#region Get MAXP table reference
		const maxp = this.tables.get(Tables.MAXP.tag);
		if (!maxp) {
			throw new Error("No MAXP table in the font");
		}
		//#endregion

		return maxp.numGlyphs;
	}

	public get glyphs() {
		//#region Return pre-calculated values in exist
		if (this._glyphs) {
			return this._glyphs;
		}
		//#endregion

		//#region Get GLYF table reference
		const glyf = this.tables.get(Tables.GLYF.tag) as Tables.GLYF || undefined;
		if (!glyf) {
			throw new Error("No GLYF table in the font");
		}

		this._glyphs = glyf.glyphs.slice();
		//#endregion

		//#region Fill array of glyphs with combined values
		//#region Get information about horizontal metrics
		const hmtx = this.tables.get(Tables.HMTX.tag) as Tables.HMTX || undefined;
		if (!hmtx) {
			throw new Error("No HMTX table in the font");
		}

		let leastAdvanceWidth = 0;

		for (let i = 0; i < this._glyphs.length; i++) {
			// Move combined values to single property
			this._glyphs[i].index = i;

			if (i >= hmtx.hMetrics.length) {
				this._glyphs[i].hAdvanceWidth = leastAdvanceWidth;
				this._glyphs[i].leftSideBearing = hmtx.leftSideBearings[0];
			} else {
				leastAdvanceWidth = hmtx.hMetrics[i].advanceWidth;

				this._glyphs[i].hAdvanceWidth = leastAdvanceWidth;
				this._glyphs[i].leftSideBearing = hmtx.hMetrics[i].leftSideBearing;
			}
		}
		//#endregion

		//#region Get information about Unicode codes
		const cmap = this.tables.get(Tables.CMAP.tag) as Tables.CMAP | undefined;
		if (cmap) {
			for (let i = 0; i < this._glyphs.length; i++) {
				this._glyphs[i].unicodes = cmap.code(i).slice();
			}
		}
		//#endregion
		//#endregion

		return this._glyphs;
	}

	public get unitsPerEm(): number {
		//#region Get HEAD table reference
		const head = this.tables.get(Tables.HEAD.tag) as Tables.HEAD | undefined;
		if (!head) {
			throw new Error("No HEAD table in the font");
		}
		//#endregion

		return head.unitsPerEm;
	}

	public get bbox(): number[] {
		//#region Initial variables
		const glyphs = this.glyphs;
		const unitsPerEm = this.unitsPerEm;

		const xMin = [];
		const yMin = [];
		const xMax = [];
		const yMax = [];
		//#endregion

		//#region Fill necessary arrays
		for (const glyph of glyphs) {
			xMin.push(glyph.xMin);
			yMin.push(glyph.yMin);
			xMax.push(glyph.xMax);
			yMax.push(glyph.yMax);
		}
		//#endregion

		return [
			Math.min.apply(null, xMin) / unitsPerEm,
			Math.min.apply(null, yMin) / unitsPerEm,
			Math.max.apply(null, xMax) / unitsPerEm,
			Math.max.apply(null, yMax) / unitsPerEm,
		];
	}

	public get italicAngle(): number {
		//#region Get POST table reference
		const post = this.tables.get(Tables.POST.tag) as Tables.POST | undefined;
		if (!post) {
			throw new Error("No POST table in the font");
		}
		//#endregion

		return post.italicAngle;
	}

	/**
	 * TEST PURPOSE ONLY
	 *
	 * @param {string} value
	 */
	// @internal
	public set fontFamily(value: string | null) {
		if (value !== null) {
			//#region Initial variables
			const codePoints = stringToCodePoints(value, true, true, false);
			//#endregion

			//#region Get NAME table reference
			const name = this.tables.get(Tables.NAME.tag);
			if (typeof name === "undefined")
				return;
			//#endregion

			//#region Firstly find existing value
			for (const nameRecord of name.nameRecords) {
				if ((nameRecord.nameID === 1) && (nameRecord.platformID === 0)) {
					nameRecord.value = codePoints;

					return;
				}
			}
			//#endregion

			//#region If there is not existing value append a new one
			name.nameRecords.push({
				nameID: 1,
				platformID: 0,
				value: codePoints
			});
			//#endregion
		}
	}

	public get fontFamily() {
		//#region Get NAME table reference
		const name = this.tables.get(Tables.NAME.tag) as Tables.NAME | undefined;
		if (!name) {
			return null;
		}
		//#endregion

		for (const nameRecord of name.nameRecords) {
			if ((nameRecord.nameID === 1) && (nameRecord.platformID === 0)) {
				return String.fromCodePoint(...unicodePointsToCodePoints(nameRecord.value, true, true, false));
			}
		}

		return null;
	}

	/**
	 * TEST PURPOSE ONLY
	 *
	 * @param {string} value
	 */
	// @internal
	public set postScriptName(value: string | null) {
		if (value !== null) {
			//#region Initial variables
			const codePoints = stringToCodePoints(value, true, true, false);
			//#endregion

			//#region Get NAME table reference
			const name = this.tables.get(Tables.NAME.tag) as Tables.NAME | undefined;
			if (!name) {
				return;
			}
			//#endregion

			//#region Firstly find existing value
			for (const nameRecord of name.nameRecords) {
				if ((nameRecord.nameID === 6) && (nameRecord.platformID === 0)) {
					nameRecord.value = codePoints;

					return;
				}
			}
			//#endregion

			//#region If there is not existing value append a new one
			name.nameRecords.push({
				nameID: 6,
				platformID: 0,
				platformSpecificID: 0,
				languageID: 0,
				value: codePoints
			});
			//#endregion
		}
	}

	public get postScriptName() {
		//#region Get NAME table reference
		const name = this.tables.get(Tables.NAME.tag) as Tables.NAME | undefined;
		if (!name)
			return null;
		//#endregion

		for (const nameRecord of name.nameRecords) {
			if ((nameRecord.nameID === 6) && (nameRecord.platformID === 0)) {
				return String.fromCodePoint(...unicodePointsToCodePoints(nameRecord.value, true, true, false));
			}
		}

		return null;
	}

	public subset(parameters = {} as FontSubsetParameters): Font {
		//#region Check input parameters
		if (!("glyphIndexes" in parameters))
			throw new Error("Missing mandatory parameter glyphIndexes");

		// Object having values for "ascent", "descent" and "lineGap"
		if (!("fontValues" in parameters))
			throw new Error("Missing mandatory parameter fontValues");

		if (!parameters.cmaps)
			throw new Error("Missing mandatory parameter cmaps");

		if (!("cmapLanguage" in parameters))
			throw new Error("Missing mandatory parameter cmapLanguage");

		let tables = new Map<number, BaseClass>();
		if (parameters.tables) {
			tables = parameters.tables;
		}

		if (!parameters.fontValues.missingGlyph) {
			parameters.fontValues.missingGlyph = missingGlyph();
		}

		if (!parameters.fontValues.nullGlyph) {
			parameters.fontValues.nullGlyph = nullGlyph();
		}
		//#endregion

		//#region Make a glyphs array
		const glyphTable = this.tables.get(Tables.GLYF.tag) as Tables.GLYF | undefined;
		if (!glyphTable) {
			throw new Error("Initialize main font object first");
		}

		//#region Append mandatory "missing glyph" and "null glyph"
		// https://developer.apple.com/fonts/TrueType-Reference-Manual/RM07/appendixB.html
		const glyphs: Tables.Glyph[] = [
			parameters.fontValues.missingGlyph,
			parameters.fontValues.nullGlyph,
		];
		//#endregion

		for (const index of parameters.glyphIndexes) {
			const glyph = glyphTable.glyphs[index];
			if (!glyph) {
				throw new Error(`Incorrect glyph index: ${index}`);
			}

			switch ((glyph.constructor as typeof BaseClass).className) {
				case Tables.SimpleGlyph.className:
				case Tables.EmptyGlyph.className:
					glyphs.push(glyph as Tables.SimpleGlyph);
					break;
				case Tables.CompoundGlyph.className:
					{
						const compoundGlyph = glyph as Tables.CompoundGlyph;
						for (let i = 0; i < compoundGlyph.components!.length; i++) {
							const component = compoundGlyph.components![i];
							const componentGlyph = glyphTable.glyphs[component.glyphIndex];
							if (typeof componentGlyph === "undefined")
								throw new Error(`Incorrect componentGlyph index: ${component.glyphIndex}`);

							glyphs.push(componentGlyph);

							component.glyphIndex = (glyphs.length - 1);
						}

						glyphs.push(glyph);
					}
					break;
				default:
					throw new Error(`Incorrect glyph's class name: ${(glyph.constructor as typeof BaseClass).className}`);
			}
		}
		//#endregion

		//#region Make HMTX table (for now put all in "hMetrics")
		tables.set(Tables.HMTX.tag, new Tables.HMTX({
			hMetrics: Array.from(glyphs, element => ({
				advanceWidth: element.hAdvanceWidth!,
				leftSideBearing: element.leftSideBearing!,
			}))
		}));
		//#endregion

		//#region Make MAXP table from glyphs
		const maxp = tables.get(Tables.MAXP.tag) as Tables.MAXP | undefined;
		if (!maxp) {
			tables.set(Tables.MAXP.tag, new Tables.MAXP({ version: 0x00010000, glyphs: glyphs }));
		}
		//#endregion

		//#region Get major metrics from array of glyphs
		const xMins: number[] = [];
		const xMaxs: number[] = [];
		const yMins: number[] = [];
		const yMaxs: number[] = [];
		const leftSideBearings: number[] = [];
		const rightSideBearings: number[] = [];
		const advanceWidths: number[] = [];

		for (const glyph of glyphs) {
			// glyph -> hmtx (vmtx) -> hhea (vhea) -> cmap -> loca -> maxp
			// "name" is a side table, "post" is mostly template

			xMins.push(glyph.xMin);
			xMaxs.push(glyph.xMax);
			yMins.push(glyph.yMin);
			yMaxs.push(glyph.yMax);

			advanceWidths.push(glyph.hAdvanceWidth!);
			leftSideBearings.push(glyph.leftSideBearing!);
			rightSideBearings.push(glyph.hAdvanceWidth! - (glyph.leftSideBearing! + glyph.xMax - glyph.xMin));
		}
		//#endregion

		//#region Make HHEA table
		tables.set(Tables.HHEA.tag, new Tables.HHEA({
			ascent: parameters.fontValues.ascent,
			descent: parameters.fontValues.descent,
			lineGap: parameters.fontValues.lineGap,
			advanceWidthMax: Math.max.apply(null, advanceWidths),
			minLeftSideBearing: Math.min.apply(null, leftSideBearings),
			minRightSideBearing: Math.min.apply(null, rightSideBearings),
			xMaxExtent: (Math.max.apply(null, leftSideBearings) + (Math.max.apply(null, xMaxs) - Math.min.apply(null, xMins))),
			numOfLongHorMetrics: glyphs.length
		}));
		//#endregion

		//#region Make HEAD table
		tables.set(Tables.HEAD.tag, new Tables.HEAD({
			flags: 3,
			unitsPerEm: parameters.fontValues.unitsPerEm,
			xMin: Math.min.apply(null, xMins),
			xMax: Math.max.apply(null, xMaxs),
			yMin: Math.min.apply(null, yMins),
			yMax: Math.max.apply(null, yMaxs)
		}));
		//#endregion

		//#region Make GLYF table
		tables.set(Tables.GLYF.tag, new Tables.GLYF({
			glyphs
		}));
		//#endregion

		//#region Make CMAP table
		// TODO Strange condition
		if (parameters.cmaps !== []) { // Have an ability to skip CMAP making
			const subTables: Tables.CMAPSubTable[] = [];

			for (const cmap of parameters.cmaps) {

				switch (cmap.format) {
					case 0:
						subTables.push(Tables.Format0.fromGlyphs(cmap.language, glyphs));
						break;
					case 4:
						subTables.push(Tables.Format4.fromGlyphs(cmap.language, glyphs, cmap.platformID, cmap.platformSpecificID));
						break;
					case 6:
						subTables.push(Tables.Format6.fromGlyphs(cmap.language, glyphs, cmap.firstCode, cmap.platformID, cmap.platformSpecificID));
						break;
					default:
						throw new Error(`Unknown CMAP table format: ${cmap}`);
				}

			}

			tables.set(Tables.CMAP.tag, new Tables.CMAP({
				subTables
			}));
		}
		//#endregion

		return new Font({
			scalerType: ScalerTypes.true,
			tables
		});
	}

	public static TTF(parameters = {} as FontTTFParameters): Font {
		//#region Check input parameters
		if (!parameters.glyphs) {
			throw new Error("Missing mandatory parameter glyphs");
		}

		// Object having values for "ascent", "descent" and "lineGap"
		if (!parameters.fontValues) {
			throw new Error("Missing mandatory parameter fontValues");
		}

		if (("cmapFormat" in parameters) === false) {
			throw new Error("Missing mandatory parameter cmapFormat");
		}

		if (("cmapLanguage" in parameters) === false) {
			throw new Error("Missing mandatory parameter cmapLanguage");
		}

		let tables = new Map<number, BaseClass>();
		if (parameters.tables) {
			tables = parameters.tables;
		}

		if (!parameters.fontValues.missingGlyph) {
			parameters.fontValues.missingGlyph = missingGlyph();
		}

		if (!parameters.fontValues.nullGlyph) {
			parameters.fontValues.nullGlyph = nullGlyph();
		}

		//#endregion

		//#region Append mandatory "missing glyph" and "null glyph"
		// https://developer.apple.com/fonts/TrueType-Reference-Manual/RM07/appendixB.html
		parameters.glyphs = [
			parameters.fontValues.missingGlyph,
			parameters.fontValues.nullGlyph,
			...parameters.glyphs
		];
		//#endregion

		//#region Make HMTX table (for now put all in "hMetrics")
		tables.set(Tables.HMTX.tag, new Tables.HMTX({
			hMetrics: Array.from(parameters.glyphs, element => ({
				advanceWidth: element.hAdvanceWidth!,
				leftSideBearing: element.leftSideBearing!,
			}))
		}));
		//#endregion

		//#region Make MAXP table from glyphs
		const maxp = tables.get(Tables.MAXP.tag) as Tables.MAXP | undefined;
		if (!maxp) {
			tables.set(Tables.MAXP.tag, new Tables.MAXP({ version: 0x00010000, glyphs: parameters.glyphs }));
		}
		//#endregion

		//#region Get major metrics from array of glyphs
		const xMins: number[] = [];
		const xMaxs: number[] = [];
		const yMins: number[] = [];
		const yMaxs: number[] = [];
		const leftSideBearings: number[] = [];
		const rightSideBearings: number[] = [];
		const advanceWidths: number[] = [];

		for (const glyph of parameters.glyphs) {
			// glyph -> hmtx (vmtx) -> hhea (vhea) -> cmap -> loca -> maxp
			// "name" is a side table, "post" is mostly template

			xMins.push(glyph.xMin);
			xMaxs.push(glyph.xMax);
			yMins.push(glyph.yMin);
			yMaxs.push(glyph.yMax);

			advanceWidths.push(glyph.hAdvanceWidth!);
			leftSideBearings.push(glyph.leftSideBearing!);
			rightSideBearings.push(glyph.hAdvanceWidth! - (glyph.leftSideBearing! + glyph.xMax - glyph.xMin));
		}
		//#endregion

		//#region Make HHEA table
		tables.set(Tables.HHEA.tag, new Tables.HHEA({
			ascent: parameters.fontValues.ascent,
			descent: parameters.fontValues.descent,
			lineGap: parameters.fontValues.lineGap,
			advanceWidthMax: Math.max.apply(null, advanceWidths),
			minLeftSideBearing: Math.min.apply(null, leftSideBearings),
			minRightSideBearing: Math.min.apply(null, rightSideBearings),
			xMaxExtent: (Math.max.apply(null, leftSideBearings) + (Math.max.apply(null, xMaxs) - Math.min.apply(null, xMins))),
			numOfLongHorMetrics: parameters.glyphs.length
		}));
		//#endregion

		//#region Make HEAD table
		tables.set(Tables.HEAD.tag, new Tables.HEAD({
			flags: 11,
			fontRevision: 456130,
			unitsPerEm: parameters.fontValues.unitsPerEm,
			xMin: Math.min.apply(null, xMins),
			xMax: Math.max.apply(null, xMaxs),
			yMin: Math.min.apply(null, yMins),
			yMax: Math.max.apply(null, yMaxs)
		}));
		//#endregion

		//#region Make GLYF table
		tables.set(Tables.GLYF.tag, new Tables.GLYF({
			glyphs: parameters.glyphs
		}));
		//#endregion

		//#region Make CMAP table
		if (parameters.cmapFormat !== (-1)) {// Have an ability to skip CMAP making
			let cmapSubtable = null;

			switch (parameters.cmapFormat) {
				case 0:
					cmapSubtable = Tables.Format0.fromGlyphs(parameters.cmapLanguage, parameters.glyphs);
					break;
				case 4:
					cmapSubtable = Tables.Format4.fromGlyphs(parameters.cmapLanguage, parameters.glyphs);
					break;
				case 6:
					cmapSubtable = Tables.Format6.fromGlyphs(parameters.cmapLanguage, parameters.glyphs);
					break;
				default:
					throw new Error(`Unknown CMAP table format: ${parameters.cmapFormat}`);
			}

			tables.set(Tables.CMAP.tag, new Tables.CMAP({
				subTables: [cmapSubtable]
			}));
		}
		//#endregion

		return new Font({
			scalerType: ScalerTypes.true,
			tables
		});
	}

	/**
	 *
	 * @param str
	 * @param platformID
	 * @param platformSpecificID
	 * @param bytes String representing bytes template ("00", "0000" etc.)
	 */
	public stringToGIDs(str: string, platformID = 3, platformSpecificID = 1, bytes: string | null = null): string[] {
		//#region Initial variables
		const result: string[] = [];

		const numGlyphs = this.numGlyphs;
		//#endregion

		//#region Find correct number of bytes for GID codes
		if (bytes === null) {
			bytes = "00";

			switch (true) {
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
		}
		//#endregion

		//#region Get CMAP table reference
		const cmap = this.tables.get(Tables.CMAP.tag);
		if (typeof cmap === "undefined")
			throw new Error("No CMAP table in the font");
		//#endregion

		//#region Find GIDs for all charpoints
		for (const char of str) {
			for (let i = 0; i < char.length; i++) {
				// Replace absent chars via GID = 0 (as it is required by standard)
				const gid = cmap.gid(char.codePointAt(i), platformID, platformSpecificID) || 0;

				result.push(`${bytes}${gid.toString(16).toLocaleUpperCase()}`.slice(-1 * bytes.length));
			}
		}
		//#endregion

		return result;
	}

	/**
	 * Return array GID (as array of GIDs) for particular string
	 * @param str
	 * @param platformID
	 * @param platformSpecificID
	 */
	stringToGIDsArray(str: string, platformID = 3, platformSpecificID = 1) {
		const result = new Map();

		//#region Get CMAP table reference
		const cmap = this.tables.get(Tables.CMAP.tag) as Tables.CMAP | undefined;
		if (!cmap) {
			throw new Error("No CMAP table in the font");
		}
		//#endregion

		for (const char of str) {
			for (let i = 0; i < char.length; i++)
				result.set(cmap.gid(char.codePointAt(i)!) || 0, 1);
		}

		return Array.from(result.keys());
	}

}
