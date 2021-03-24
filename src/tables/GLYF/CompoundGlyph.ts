import { SeqStream } from "bytestreamjs";
import { Matrix } from "../../Matrix";
import { getF2Dot14, appendF2Dot14, checkFlag } from "../../common";
import { CompoundGlyphFlags } from "./CompoundGlyphFlags";
import { Glyph, GlyphParameters } from "./Glyph";

export interface ComponentSimple {
	glyphIndex: number;
	flags: number;
	matrix: Matrix;
}

export interface ComponentWithPoints extends ComponentSimple {
	matchingPoint1: number;
	matchingPoint2: number;
}

export type Component = ComponentSimple | ComponentWithPoints;

export interface CompoundGlyphParameters extends GlyphParameters {
	components?: Component[];
	instructions?: number[];
}

export class CompoundGlyph extends Glyph {

	private _components?: Component[];
	private _instructions?: number[];

	constructor(parameters: CompoundGlyphParameters = {}) {
		super(parameters);

		if (parameters.components !== undefined) {
			this.components = parameters.components;
		}
		if (parameters.instructions !== undefined) {
			this.instructions = parameters.instructions;
		}
	}

	public static get className() {
		return "CompoundGlyph";
	}

	public decode() {
		super.decode();

		//#region Check we have a correct numberOfContours
		if ((this.numberOfContours === 0) || (this.numberOfContours > 0))
			throw new Error(`Incorrect numberOfContours for CompoundGlyph class: ${this.numberOfContours}`);
		//#endregion
		//#region Initial variables
		let flags = 0;
		this.instructions = [];
		this.components = [];
		//#endregion
		//#region Read components
		do {
			//#region Initial variables
			const matrix = new Matrix();

			let matchingPoints: { matchingPoint1: number; matchingPoint2: number; } | null = null;
			//#endregion
			//#region Read basic information
			flags = this.stream.getUint16();
			const glyphIndex = this.stream.getUint16();
			//#endregion
			//#region Read translation coordinates
			switch (true) {
				case (checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
					matrix.e = this.stream.getInt16();
					matrix.f = this.stream.getInt16();

					break;
				case (!checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
					matrix.e = (this.stream.getBlock(1))[0];
					matrix.f = (this.stream.getBlock(1))[0];

					break;
				case (checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
					matchingPoints = {
						matchingPoint1: this.stream.getInt16(),
						matchingPoint2: this.stream.getInt16(),
					};

					break;
				case (!checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
					matchingPoints = {
						matchingPoint1: (this.stream.getBlock(1))[0],
						matchingPoint2: (this.stream.getBlock(1))[0],
					};

					break;
			}
			//#endregion
			//#region Read scaling and rotation details
			switch (true) {
				case checkFlag(flags, CompoundGlyphFlags.WE_HAVE_A_SCALE):
					matrix.a = getF2Dot14(this.stream);
					matrix.d = matrix.a;

					break;
				case checkFlag(flags, CompoundGlyphFlags.WE_HAVE_AN_X_AND_Y_SCALE):
					matrix.a = getF2Dot14(this.stream);
					matrix.d = getF2Dot14(this.stream);

					break;
				case checkFlag(flags, CompoundGlyphFlags.WE_HAVE_A_TWO_BY_TWO):
					matrix.a = getF2Dot14(this.stream);
					matrix.b = getF2Dot14(this.stream);
					matrix.c = getF2Dot14(this.stream);
					matrix.d = getF2Dot14(this.stream);

					break;
			}
			//#endregion
			const componentParameters: Component = {
				glyphIndex,
				flags,
				matrix,
				...(matchingPoints || {})
			};

			this.components.push(
				componentParameters
			);

		} while (checkFlag(flags, CompoundGlyphFlags.MORE_COMPONENTS));
		//#endregion
		//#region Read instructions
		if (checkFlag(flags, CompoundGlyphFlags.WE_HAVE_INSTRUCTIONS)) {
			const numInstr = this.stream.getUint16();

			for (let i = 0; i < numInstr; i++) {
				const instruction = (this.stream.getBlock(1))[0];
				this.instructions.push(instruction);
			}
		}
		//#endregion
	}

	public encode(stream: SeqStream): void {
		super.encode(stream);

		try {
			if (!this.components) {
				throw new Error("Property 'components' is empty");
			}
			if (!this.instructions) {
				throw new Error("Property 'instructions' is empty");
			}

			//#region Store information about components
			for (let i = 0; i < this.components.length; i++) {
				const component = this.components[i];

				//#region Set correct "flags" value
				let flags = component.flags;

				if (("matchingPoint1" in component) || ("matchingPoint1" in component)) {
					flags &= ~CompoundGlyphFlags.ARGS_ARE_XY_VALUES;

					if ((component.matchingPoint1 > 255) ||
						(component.matchingPoint1 < 0) ||
						(component.matchingPoint2 > 255) ||
						(component.matchingPoint2 < 0))
						flags |= CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS;

					else
						flags &= ~CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS;
				} else {
					flags |= CompoundGlyphFlags.ARGS_ARE_XY_VALUES;

					if ((component.matrix.e > 255) ||
						(component.matrix.e < 0) ||
						(component.matrix.f > 255) ||
						(component.matrix.f < 0)) {
						flags |= CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS;
					} else {
						flags &= ~CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS;
					}
				}

				if (component.matrix.b || component.matrix.c) {
					flags |= CompoundGlyphFlags.WE_HAVE_A_TWO_BY_TWO;
				} else {
					if ((component.matrix.a !== 1) || (component.matrix.d !== 1)) {
						if (component.matrix.a !== component.matrix.d) {
							flags |= CompoundGlyphFlags.WE_HAVE_AN_X_AND_Y_SCALE;
						} else {
							flags |= CompoundGlyphFlags.WE_HAVE_A_SCALE;
						}
					}
				}

				if (i < (this.components.length - 1)) {
					flags |= CompoundGlyphFlags.MORE_COMPONENTS;
				}
				//#endregion
				//#region Store information about flags and glyph index first
				stream.appendUint16(flags);
				stream.appendUint16(component.glyphIndex);
				//#endregion
				//#region Store translation coordinates
				switch (true) {
					case (checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
						stream.appendInt16(component.matrix.e);
						stream.appendInt16(component.matrix.f);

						break;
					case (!checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
						stream.appendView(new Uint8Array([component.matrix.e]));
						stream.appendView(new Uint8Array([component.matrix.f]));

						break;
					case (checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
						stream.appendInt16((component as ComponentWithPoints).matchingPoint1); // TODO Fix `component as ComponentWithPoints`
						stream.appendInt16((component as ComponentWithPoints).matchingPoint2);

						break;
					case (!checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
						stream.appendView(new Uint8Array([(component as ComponentWithPoints).matchingPoint1]));
						stream.appendView(new Uint8Array([(component as ComponentWithPoints).matchingPoint2]));

						break;
				}
				//#endregion
				//#region Store scaling and rotation details
				switch (true) {
					case checkFlag(flags, CompoundGlyphFlags.WE_HAVE_A_SCALE):
						appendF2Dot14(component.matrix.a, stream);

						break;
					case checkFlag(flags, CompoundGlyphFlags.WE_HAVE_AN_X_AND_Y_SCALE):
						appendF2Dot14(component.matrix.a, stream);
						appendF2Dot14(component.matrix.d, stream);

						break;
					case checkFlag(flags, CompoundGlyphFlags.WE_HAVE_A_TWO_BY_TWO):
						appendF2Dot14(component.matrix.a, stream);
						appendF2Dot14(component.matrix.b, stream);
						appendF2Dot14(component.matrix.c, stream);
						appendF2Dot14(component.matrix.d, stream);

						break;
				}
				//#endregion
			}
			//#endregion
			//#region Store information about instruction
			stream.appendUint16(this.instructions.length);

			if (this.instructions.length)
				stream.appendView(new Uint8Array(this.instructions));
			//#endregion
		} catch (e) {
			e.message = `Failed to execute 'encode' on 'CompoundGlyph. ${e.message}`;
			throw e;
		}
	}

	public get components() {
		if ("_components" in this) {
			this.decode();
		}

		return this._components;
	}

	public set components(value: Component[] | undefined) {
		this._components = value;
	}

	get instructions() {
		if ("_instructions" in this)
			this.decode();

		return this._instructions;
	}

	set instructions(value: number[] | undefined) {
		this._instructions = value;
	}

}
