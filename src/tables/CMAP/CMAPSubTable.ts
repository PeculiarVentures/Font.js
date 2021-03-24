import { BaseClass } from "../../BaseClass";

export interface CMAPSubTableParameters {
	format?: number;
	platformID?: PlatformIDs;
	platformSpecificID?: number;
}

/**
 * Platform IDs
 * @see https://docs.microsoft.com/en-us/typography/opentype/spec/cmap#platform-ids
 */
export enum PlatformIDs {
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
 * @see https://docs.microsoft.com/en-us/typography/opentype/spec/cmap#use-of-the-language-field-in-cmap-subtables
 */
export interface CMAPLanguage {
	language: number;
}

/**
 * Representation of EncodingRecord
 */
export class CMAPSubTable extends BaseClass {

	/**
	 * Platform ID
	 */
	public platformID: PlatformIDs;
	/**
	 * Platform-specific encoding ID
	 */
	public platformSpecificID: number;
	/**
	 * Format number of CMAP subtable
	 */
	public format: number;

	constructor(parameters: CMAPSubTableParameters = {}) {
		super();

		this.platformID = parameters.platformID || PlatformIDs.Unicode;
		this.platformSpecificID = parameters.platformSpecificID || 0;
		this.format = parameters.format || 0;
	}

	public static get className(): string {
		return "CMAPSubTable";
	}

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
