import { SeqStream } from "bytestreamjs";
import { Matrix } from "../../Matrix";
import { getF2Dot14, appendF2Dot14, checkFlag } from "../../common";
import { CompoundGlyphFlags } from "./CompoundGlyphFlags";
import { Glyph, type GlyphParameters } from "./Glyph";

/**
 * Reads an unsigned byte as the signed 8-bit value that ARGS_ARE_XY_VALUES byte arguments hold.
 */
function toInt8(value: number): number {
  return value > 0x7f ? value - 0x100 : value;
}

function isInt8(value: number): boolean {
  return value >= -0x80 && value <= 0x7f;
}

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
  public components!: Component[];
  public instructions!: number[];

  constructor(parameters: CompoundGlyphParameters = {}) {
    super(parameters);

    this.components ??= parameters.components || [];
    this.instructions ??= parameters.instructions || [];
  }

  public static override get className() {
    return "CompoundGlyph";
  }

  public override decode() {
    super.decode();

    //#region Check we have a correct numberOfContours
    if (this.numberOfContours >= 0) throw new Error(`Incorrect numberOfContours for CompoundGlyph class: ${this.numberOfContours}`);
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

      let matchingPoints: { matchingPoint1: number; matchingPoint2: number } | null = null;
      //#endregion
      //#region Read basic information
      flags = this.stream.getUint16();
      const glyphIndex = this.stream.getUint16();
      //#endregion
      //#region Read translation coordinates
      switch (true) {
        case checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES):
          matrix.e = this.stream.getInt16();
          matrix.f = this.stream.getInt16();

          break;
        case !checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES):
          matrix.e = toInt8(this.stream.getBlock(1)[0]);
          matrix.f = toInt8(this.stream.getBlock(1)[0]);

          break;
        case checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES):
          matchingPoints = {
            matchingPoint1: this.stream.getUint16(),
            matchingPoint2: this.stream.getUint16(),
          };

          break;
        case !checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES):
          matchingPoints = {
            matchingPoint1: this.stream.getBlock(1)[0],
            matchingPoint2: this.stream.getBlock(1)[0],
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
        ...matchingPoints,
      };

      this.components.push(componentParameters);
    } while (checkFlag(flags, CompoundGlyphFlags.MORE_COMPONENTS));
    //#endregion
    //#region Read instructions
    if (checkFlag(flags, CompoundGlyphFlags.WE_HAVE_INSTRUCTIONS)) {
      const numInstr = this.stream.getUint16();

      for (let i = 0; i < numInstr; i++) {
        const instruction = this.stream.getBlock(1)[0];
        this.instructions.push(instruction);
      }
    }
    //#endregion
  }

  public override encode(stream: SeqStream): void {
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

        if ("matchingPoint1" in component) {
          flags &= ~CompoundGlyphFlags.ARGS_ARE_XY_VALUES;

          if (component.matchingPoint1 > 255 || component.matchingPoint1 < 0 || component.matchingPoint2 > 255 || component.matchingPoint2 < 0) flags |= CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS;
          else flags &= ~CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS;
        } else {
          flags |= CompoundGlyphFlags.ARGS_ARE_XY_VALUES;

          if (!isInt8(component.matrix.e) || !isInt8(component.matrix.f)) {
            flags |= CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS;
          } else {
            flags &= ~CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS;
          }
        }

        if (component.matrix.b || component.matrix.c) {
          flags |= CompoundGlyphFlags.WE_HAVE_A_TWO_BY_TWO;
        } else {
          if (component.matrix.a !== 1 || component.matrix.d !== 1) {
            if (component.matrix.a !== component.matrix.d) {
              flags |= CompoundGlyphFlags.WE_HAVE_AN_X_AND_Y_SCALE;
            } else {
              flags |= CompoundGlyphFlags.WE_HAVE_A_SCALE;
            }
          }
        }

        if (i < this.components.length - 1) {
          flags |= CompoundGlyphFlags.MORE_COMPONENTS;
        } else {
          flags &= ~CompoundGlyphFlags.MORE_COMPONENTS;
        }

        // Instructions follow the last component only when this flag is set on it
        if (i === this.components.length - 1 && this.instructions.length) {
          flags |= CompoundGlyphFlags.WE_HAVE_INSTRUCTIONS;
        } else {
          flags &= ~CompoundGlyphFlags.WE_HAVE_INSTRUCTIONS;
        }
        //#endregion
        //#region Store information about flags and glyph index first
        stream.appendUint16(flags);
        stream.appendUint16(component.glyphIndex);
        //#endregion
        //#region Store translation coordinates
        switch (true) {
          case checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES):
            stream.appendInt16(component.matrix.e);
            stream.appendInt16(component.matrix.f);

            break;
          case !checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES):
            stream.appendView(new Uint8Array(new Int8Array([component.matrix.e, component.matrix.f]).buffer));

            break;
          case checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES):
            stream.appendUint16((component as ComponentWithPoints).matchingPoint1); // TODO Fix `component as ComponentWithPoints`
            stream.appendUint16((component as ComponentWithPoints).matchingPoint2);

            break;
          case !checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES):
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
      if (this.instructions.length) {
        stream.appendUint16(this.instructions.length);
        stream.appendView(new Uint8Array(this.instructions));
      }
      //#endregion
    } catch (e) {
      const error = "Failed to execute 'encode' on 'CompoundGlyph";
      if (e instanceof Error) {
        e.message = `${error}. ${e.message}`;
        throw e;
      }

      throw new Error(error);
    }
  }
}
