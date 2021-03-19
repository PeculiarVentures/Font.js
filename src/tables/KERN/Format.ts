import { BaseClass } from "../../BaseClass";

export interface KERNFormatParameters {
  map?: Map<string, number>; // TODO Fix any
}

export class KERNFormat extends BaseClass {

  public map: Map<string, number>;

	constructor(parameters: KERNFormatParameters = {}) {
		super();

		this.map = parameters.map || new Map();
	}

	public static get format(): number {
		throw new Error("Incorrectly initialized format class");
	}
}
