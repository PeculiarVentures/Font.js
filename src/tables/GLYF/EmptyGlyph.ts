import { SeqStream } from "bytestreamjs";
import { Glyph, GlyphParameters } from "./Glyph";

export interface EmptyGlyphParameters extends GlyphParameters {
}

export class EmptyGlyph extends Glyph {

	constructor(_parameters: EmptyGlyphParameters = {}) {
		super();
	}

	public static get className() {
		return "EmptyGlyph";
	}

	public decode() {
		super.decode();

		if (this.numberOfContours !== 0) {
			throw new Error(`Incorrect numberOfContours for EmptyGlyph class: ${this.numberOfContours}`);
		}
	}

	public encode(_stream: SeqStream) {
		// Nothing should be encoded here
		// TODO Should we use super.encode?
	}

}
