import { BaseClass } from "../../BaseClass";

export interface CMAPSubTableParameters {
	format?: number;
	platformID?: number;
	platformSpecificID?: number;
}

export class CMAPSubTable extends BaseClass {

	public format: number;
	public platformID: number;
	public platformSpecificID: number;

	constructor(parameters: CMAPSubTableParameters = {}) {
		super();

		this.format = parameters.format || 0;
		this.platformID = parameters.platformID || 0;
		this.platformSpecificID = parameters.platformSpecificID || 0;
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
