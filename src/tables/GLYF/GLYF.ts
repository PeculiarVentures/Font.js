import { SeqStream } from "bytestreamjs";
import { FontTable } from "../../Table";
import { LOCA } from "../LOCA";
import { CompoundGlyph } from "./CompoundGlyph";
import { EmptyGlyph } from "./EmptyGlyph";
import { Glyph } from "./Glyph";
import { SimpleGlyph } from "./SimpleGlyph";

export interface GLYFParameters {
	glyphs?: Glyph[];
}

export class GLYF extends FontTable {
	public glyphs: Glyph[];
	public loca?: number[];

	constructor(parameters: GLYFParameters = {}) {
		super();

		this.glyphs = parameters.glyphs || [];
	}

	public static get className() {
		return "GLYF";
	}

	public static get tag() {
		return 0x676C7966;
	}

	public toStream(stream: SeqStream): boolean {
		this.loca = [0];

		for (const glyph of this.glyphs) {
			//#region Check we do have something to put
			if (glyph.numberOfContours === 0) {
				this.loca.push(this.loca[this.loca.length - 1]);
				continue;
			}
			//#endregion

			//#region Store previous length of the stream
			const prevLength = stream.length;
			//#endregion

			//#region Encode individual glyph
			glyph.encode(stream);
			//#endregion

			//#region Put alignment bytes
			const alignmentDifference = 4 - (stream.length % 4);
			if (alignmentDifference) {
				const alignmentBuffer = new ArrayBuffer(alignmentDifference);
				stream.appendView(new Uint8Array(alignmentBuffer));
			}
			//#endregion

			//#region Update "loca" table
			this.loca.push(stream.length - prevLength + this.loca[this.loca.length - 1]);
			//#endregion
		}

		return true;
	}

	/**
	 * Convert SeqStream data to object
	 * @param stream
	 * @param numGlyphs Value from 'maxp' table
	 * @param loca Reference to 'loca' table
	 * @returns Result of the function
	 */
	static fromStream(stream = new SeqStream(), numGlyphs: number, loca: LOCA) {
		//#region Make streams for all glyphs
		if (numGlyphs !== (loca.offsets.length - 1))
			throw new Error(`Inconsistent values: numGlyphs (${numGlyphs}) !== (loca.offsets.length - 1) (${loca.offsets.length - 1})`);

		const streams = [];

		for (let i = 1; i < loca.offsets.length; i++) {
			// Could be situation when there is big LOCA but for most of
			// the glyphs there are zero lengths
			if (loca.offsets[i - 1] >= stream.length) {
				streams.push(new SeqStream());
				continue;
			}

			streams.push(new SeqStream({ stream: stream.stream.slice(loca.offsets[i - 1], loca.offsets[i]) })); // TODO Use subarray
		}
		//#endregion

		return new GLYF({ glyphs: Array.from(streams, element => GLYF.new(element)) as Glyph[] }); // TODO Fix `as Glyph[]`
	}

	private static new(stream: SeqStream): Glyph | null { // TODO: Move to fabric to fix circular dependency
		const numberOfContours = stream.getInt16();
		stream.resetPosition();

		switch (true) {
			case (numberOfContours === 0):
				return new EmptyGlyph({ stream });
			case (numberOfContours > 0):
				return new SimpleGlyph({ stream });
			case (numberOfContours < 0):
				return new CompoundGlyph({ stream });
		}

		return null;
	}

}

