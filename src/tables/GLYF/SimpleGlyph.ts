import { SeqStream } from "bytestreamjs";
import { checkFlag } from "../../common.js";
import { SimpleGlyphFlags } from "./SimpleGlyphFlags";
import { Glyph, GlyphParameters } from "./Glyph";

export interface SimpleGlyphParameters extends GlyphParameters {
	endPtsOfContours?: number[];
	instructions?: number[];
	flags?: number[];
	xCoordinates?: number[];
	yCoordinates?: number[];
}

export class SimpleGlyph extends Glyph {

	public hAdvanceWidth?: number;
	public leftSideBearing?: number;
	private _endPtsOfContours?: number[];
	private _instructions?: number[];
	private _flags?: number[];
	private _xCoordinates?: number[];
	private _yCoordinates?: number[];

	constructor(parameters: SimpleGlyphParameters = {}) {
		super(parameters);

		if (parameters.endPtsOfContours !== undefined)
			this.endPtsOfContours = parameters.endPtsOfContours;
		if (parameters.instructions !== undefined)
			this.instructions = parameters.instructions;
		if (parameters.flags !== undefined)
			this.flags = parameters.flags;
		if (parameters.xCoordinates !== undefined)
			this.xCoordinates = parameters.xCoordinates;
		if (parameters.yCoordinates !== undefined)
			this.yCoordinates = parameters.yCoordinates;
	}

	public static get className() {
		return "SimpleGlyph";
	}

	public decode(): void {
		super.decode();

		//#region Check we have a correct numberOfContours
		if ((this.numberOfContours === 0) || (this.numberOfContours < 0)) {
			throw new Error(`Incorrect numberOfContours for SimpleGlyph class: ${this.numberOfContours}`);
		}
		//#endregion
		//#region Initial variables
		// TODO each assignment calls 'decode' method. Would it be better to set private fields
		this.endPtsOfContours = [];
		this.instructions = [];
		this.flags = [];
		this.xCoordinates = [];
		this.yCoordinates = [];
		//#endregion
		//#region Fill "endPtsOfContours"
		for (let i = 0; i < this.numberOfContours; i++) {
			const endPtOfContour = this.stream.getUint16();
			this.endPtsOfContours.push(endPtOfContour);
		}
		//#endregion
		//#region Fill "instructions"
		const instructionLength = this.stream.getUint16();

		for (let i = 0; i < instructionLength; i++) {
			const instruction = this.stream.getBlock(1);
			this.instructions.push(instruction[0]);
		}
		//#endregion
		const numberOfCoordinates = this.endPtsOfContours[this.endPtsOfContours.length - 1] + 1;
		//#region Fill "flags"
		for (let i = 0; i < numberOfCoordinates; i++) {
			const flag = this.stream.getBlock(1);
			this.flags.push(flag[0]);

			if (flag[0] & SimpleGlyphFlags.REPEAT_FLAG) {
				const repeatCount = this.stream.getBlock(1);
				for (let j = 0; j < repeatCount[0]; j++) {
					this.flags.push(flag[0]);
					i += 1;
				}
			}
		}
		//#endregion
		//#region Put correct flags at all beggining of contours
		this.flags[0] |= SimpleGlyphFlags.OVERLAP_SIMPLE;

		for (let i = 0; i < (this.endPtsOfContours.length - 1); i++) {
			this.flags[this.endPtsOfContours[i] + 1] |= SimpleGlyphFlags.OVERLAP_SIMPLE;
		}
		//#endregion
		//#region Fill X coordinates
		let p = 0;

		for (const flag of this.flags) {
			let x = 0;

			if ((flag & SimpleGlyphFlags.X_SHORT_VECTOR) === SimpleGlyphFlags.X_SHORT_VECTOR) {
				x = (this.stream.getBlock(1))[0];

				if ((flag & SimpleGlyphFlags.X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR) === 0) {
					x = (-x);
				}

				x += p;
			} else {
				if ((flag & SimpleGlyphFlags.X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR) === SimpleGlyphFlags.X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR) {
					x = p;
				} else {
					x = p + this.stream.getInt16();
				}
			}

			this.xCoordinates.push(x);

			p = x;
		}
		//#endregion
		//#region Fill Y coordinates
		p = 0;

		for (const flag of this.flags) {
			let y = 0;

			if ((flag & SimpleGlyphFlags.Y_SHORT_VECTOR) === SimpleGlyphFlags.Y_SHORT_VECTOR) {
				y = (this.stream.getBlock(1))[0];

				if ((flag & SimpleGlyphFlags.Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR) === 0) {
					y = (-y);
				}

				y += p;
			} else {
				if ((flag & SimpleGlyphFlags.Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR) === SimpleGlyphFlags.Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR) {
					y = p;
				} else {
					y = p + this.stream.getInt16();
				}
			}

			this.yCoordinates.push(y);

			p = y;
		}
		//#endregion
	}

	public encode(stream: SeqStream): void {
		super.encode(stream);

		try {
			//#region Store previous length of the stream
			const prevLength = stream.length;
			//#endregion
			//#region Check consistency
			if (!this.endPtsOfContours) {
				throw new Error("'endPtsOfContours' field is empty");
			}
			const numberOfCoordinates = this.endPtsOfContours[this.endPtsOfContours.length - 1] + 1;

			if (!this.flags || this.flags.length !== numberOfCoordinates) {
				throw new Error("Inconsistency between length of 'flags' and 'endPtsOfContours' values");
			}

			if (!this.xCoordinates || this.xCoordinates.length !== numberOfCoordinates) {
				throw new Error("Inconsistency between length of 'xCoordinates' and 'endPtsOfContours' values");
			}

			if (!this.yCoordinates || this.yCoordinates.length !== numberOfCoordinates) {
				throw new Error("Inconsistency between length of 'yCoordinates' and 'endPtsOfContours' values");
			}
			//#endregion
			//#region Put "endPtsOfContours" values
			for (const endPtOfContour of this.endPtsOfContours)
				stream.appendUint16(endPtOfContour);
			//#endregion
			//#region Put "instructions" values
			if (!this.instructions) {
				throw new Error("'instructions' field is empty");
			}
			stream.appendUint16(this.instructions.length);

			if (this.instructions.length)
				stream.appendView(new Uint8Array(this.instructions));
			//#endregion
			//#region Put "flags" values
			const flagBytes = [];

			for (let i = 0; i < this.flags.length;) {
				let flag = this.flags[i];

				if (checkFlag(flag, SimpleGlyphFlags.REPEAT_FLAG)) {
					let repeatCount = 0;

					for (i++; i < this.flags.length; i++, repeatCount++) {
						if (this.flags[i] !== flag)
							break;
					}

					if (repeatCount) {
						flagBytes.push(flag);
						flagBytes.push(repeatCount);
					} else {
						flag &= ~SimpleGlyphFlags.REPEAT_FLAG;
						flagBytes.push(flag);
					}

				} else {
					flagBytes.push(flag);
					i++;
				}
			}

			stream.appendView(new Uint8Array(flagBytes));
			//#endregion
			//#region Put X coordinates
			let p = 0;

			for (let i = 0; i < this.xCoordinates.length; i++) {
				const flag = this.flags[i];

				let x = this.xCoordinates[i];
				const real = x;

				if ((flag & SimpleGlyphFlags.X_SHORT_VECTOR) === SimpleGlyphFlags.X_SHORT_VECTOR) {
					if ((flag & SimpleGlyphFlags.X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR) === 0) {
						x = (-x);
						p = (-p);
					}

					x -= p;

					stream.appendView(new Uint8Array([x]));
				} else {
					if ((flag & SimpleGlyphFlags.X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR) === SimpleGlyphFlags.X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR)
						x = p;
					else {
						x -= p;

						stream.appendInt16(x);
					}
				}

				p = real;
			}
			//#endregion
			//#region Put Y coordinates
			p = 0;

			for (let i = 0; i < this.yCoordinates.length; i++) {
				const flag = this.flags[i];

				let y = this.yCoordinates[i];
				const real = y;

				if ((flag & SimpleGlyphFlags.Y_SHORT_VECTOR) === SimpleGlyphFlags.Y_SHORT_VECTOR) {
					if ((flag & SimpleGlyphFlags.Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR) === 0) {
						y = (-y);
						p = (-p);
					}

					y -= p;

					stream.appendView(new Uint8Array([y]));
				} else {
					if ((flag & SimpleGlyphFlags.Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR) === SimpleGlyphFlags.Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR)
						y = p;
					else {
						y -= p;

						stream.appendInt16(y);
					}
				}

				p = real;
			}
			//#endregion
			//#region Padding to even length
			if ((stream.length - prevLength) % 2)
				stream.appendView(new Uint8Array([0]));
			//#endregion
		} catch (e) {
			e.message = `Failed to execute 'encode' on 'SimpleGlyph'. ${e.message}`;
			throw e;
		}
	}

	public get endPtsOfContours() {
		if ("_endPtsOfContours" in this) {
			this.decode();
		}

		return this._endPtsOfContours;
	}

	public set endPtsOfContours(value: number[] | undefined) {
		this._endPtsOfContours = value;
	}

	public get instructions() {
		if ("_instructions" in this) {
			this.decode();
		}

		return this._instructions;
	}

	public set instructions(value: number[] | undefined) {
		this._instructions = value;
	}

	public get flags() {
		if ("_flags" in this) {
			this.decode();
		}

		return this._flags;
	}

	public set flags(value: number[] | undefined) {
		this._flags = value;
	}

	public get xCoordinates() {
		if ("_xCoordinates" in this) {
			this.decode();
		}

		return this._xCoordinates;
	}

	public set xCoordinates(value: number[] | undefined) {
		this._xCoordinates = value;
	}

	public get yCoordinates() {
		if ("_yCoordinates" in this) {
			this.decode();
		}

		return this._yCoordinates;
	}

	public set yCoordinates(value: number[] | undefined) {
		this._yCoordinates = value;
	}

}
