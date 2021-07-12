import { BaseClass } from "../../BaseClass";
import { Glyph } from "../GLYF";

export interface CMAPSubTableParameters {
	platformID?: CMAPPlatformIDs;
	platformSpecificID?: number;
}

/**
 * Platform IDs
 * @see https://docs.microsoft.com/en-us/typography/opentype/spec/cmap#platform-ids
 */
export enum CMAPPlatformIDs {
	/**
	 * Various
	 */
	Unicode = 0,
	/**
	 * Script manager code
	 */
	Macintosh = 1,
	/**
	 * ISO encoding
	 * @deprecated
	 */
	ISO = 2,
	/**
	 * Windows encoding
	 */
	Windows = 3,
	/**
	 * Custom
	 */
	Custom = 4,
}

/**
 * Represents CMAP subtable with language field
 */
export interface CMAPLanguage {
	/**
	 * Language number
	 * @see https://docs.microsoft.com/en-us/typography/opentype/spec/cmap#use-of-the-language-field-in-cmap-subtables
	 */
	language: number;
}

/**
 * Map <code, index>
 */
export type GlyphMap = Map<number, number>;

/**
 * Representation of EncodingRecord
 */
export abstract class CMAPSubTable extends BaseClass {

	/**
	 * Platform ID
	 */
	public platformID: CMAPPlatformIDs;
	/**
	 * Platform-specific encoding ID
	 */
	public platformSpecificID: number;
	/**
	 * Format number of CMAP subtable
	 */
	public abstract readonly format: number;

	/**
	 * Glyph mapping table by code
	 */
	private _glyphMap?: GlyphMap;

	constructor(parameters: CMAPSubTableParameters = {}) {
		super();

		this.platformID = parameters.platformID || CMAPPlatformIDs.Unicode;
		this.platformSpecificID = parameters.platformSpecificID || 0;
	}

	public static get className(): string {
		return "CMAPSubTable";
	}

	/**
	 * Returns glyph mapping table by code
	 * @returns 
	 */
	public getGlyphMap(): GlyphMap {
		if (!this._glyphMap) {
			this._glyphMap = this.onGetGlyphMap();
		}

		return this._glyphMap;
	}

	protected abstract onGetGlyphMap(): GlyphMap;

	/**
	 * Return character code by GID
	 * @param gid Glyph index (GID)
	 */
	public code(gid: number): any[] {
		throw new Error("Method not implemented.");
	}

	/**
	 * Return GID by character code
	 * @param code Character code
	 */
	public gid(code: number): number {
		throw new Error("Method not implemented.");
	}

}
