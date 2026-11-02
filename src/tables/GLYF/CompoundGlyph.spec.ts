import { SeqStream } from "bytestreamjs";
import { assert, describe, it } from "vitest";
import { fixtureStream } from "../../../test/fixtures";
import { Font } from "../../Font";
import { Matrix } from "../../Matrix";
import { CompoundGlyph, type Component, type ComponentWithPoints } from "./CompoundGlyph";
import { CompoundGlyphFlags } from "./CompoundGlyphFlags";

function encode(glyph: CompoundGlyph): Uint8Array {
  const stream = new SeqStream();
  glyph.encode(stream);

  return new Uint8Array(stream.buffer);
}

function decode(bytes: Uint8Array): CompoundGlyph {
  return new CompoundGlyph({ stream: new SeqStream({ buffer: bytes.slice().buffer }) });
}

function component(glyphIndex: number, e: number, f: number): Component {
  return { glyphIndex, flags: 0, matrix: new Matrix({ e, f }) };
}

const header = [0xff, 0xff, 0, 0, 0, 0, 0, 0, 0, 0]; // numberOfContours = -1, empty bbox

describe("CompoundGlyph", () => {
  it("writes XY offsets in -128..127 as signed bytes", () => {
    const glyph = new CompoundGlyph({ numberOfContours: -1, components: [component(1, -30, 127), component(2, -128, 0)] });
    const bytes = encode(glyph);

    // flags MORE_COMPONENTS | ARGS_ARE_XY_VALUES, glyph 1, int8 args; flags ARGS_ARE_XY_VALUES, glyph 2, int8 args
    assert.deepStrictEqual([...bytes], [...header, 0x00, 0x22, 0x00, 0x01, 0xe2, 0x7f, 0x00, 0x02, 0x00, 0x02, 0x80, 0x00]);

    const parsed = decode(bytes);
    assert.deepStrictEqual(
      parsed.components.map((c) => [c.glyphIndex, c.matrix.e, c.matrix.f]),
      [
        [1, -30, 127],
        [2, -128, 0],
      ],
    );
  });

  it("writes XY offsets outside -128..127 as words", () => {
    const glyph = new CompoundGlyph({ numberOfContours: -1, components: [component(4, 200, -129)] });
    const bytes = encode(glyph);

    // flags ARG_1_AND_2_ARE_WORDS | ARGS_ARE_XY_VALUES, glyph 4, int16 200, int16 -129
    assert.deepStrictEqual([...bytes], [...header, 0x00, 0x03, 0x00, 0x04, 0x00, 0xc8, 0xff, 0x7f]);
    assert.deepStrictEqual(
      decode(bytes).components.map((c) => [c.matrix.e, c.matrix.f]),
      [[200, -129]],
    );
  });

  it("keeps matching point numbers unsigned", () => {
    const points: ComponentWithPoints = { glyphIndex: 3, flags: 0, matrix: new Matrix(), matchingPoint1: 200, matchingPoint2: 7 };
    const words: ComponentWithPoints = { glyphIndex: 5, flags: 0, matrix: new Matrix(), matchingPoint1: 300, matchingPoint2: 40000 };
    const parsed = decode(encode(new CompoundGlyph({ numberOfContours: -1, components: [points, words] })));

    assert.deepStrictEqual(
      parsed.components.map((c) => [(c as ComponentWithPoints).matchingPoint1, (c as ComponentWithPoints).matchingPoint2]),
      [
        [200, 7],
        [300, 40000],
      ],
    );
    assert.isFalse((parsed.components[0].flags & CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) !== 0);
    assert.isTrue((parsed.components[1].flags & CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) !== 0);
  });

  it("writes instructions only with WE_HAVE_INSTRUCTIONS on the last component", () => {
    const withoutInstructions = encode(new CompoundGlyph({ numberOfContours: -1, components: [component(1, 0, 0)] }));
    assert.strictEqual(withoutInstructions.length, header.length + 6);

    const glyph = new CompoundGlyph({ numberOfContours: -1, components: [component(1, 0, 0), component(2, 0, 0)], instructions: [0xb0, 0x01] });
    const parsed = decode(encode(glyph));
    assert.deepStrictEqual(parsed.instructions, [0xb0, 0x01]);
    assert.isFalse((parsed.components[0].flags & CompoundGlyphFlags.WE_HAVE_INSTRUCTIONS) !== 0);
    assert.isTrue((parsed.components[1].flags & CompoundGlyphFlags.WE_HAVE_INSTRUCTIONS) !== 0);
  });

  it("keeps the Agrave accent offset of the fixture font through toStream", () => {
    const font = Font.fromStream(fixtureStream("FontJSTest-Regular.ttf"));
    const out = new SeqStream();
    font.toStream(out);
    const again = Font.fromStream(new SeqStream({ stream: out.stream.slice(0, out.length) }));

    // What other readers see: x = 200 needs int16 words (as a byte it would read as -56)
    const agraveBytes = encode(again.glyphs[5] as CompoundGlyph);
    assert.deepStrictEqual(Array.from(agraveBytes.subarray(10)), [0x00, 0x22, 0x00, 0x02, 0x00, 0x00, 0x00, 0x03, 0x00, 0x04, 0x00, 0xc8, 0x00, 0x00]);

    for (const parsed of [font, again]) {
      const agrave = parsed.glyphs[5] as CompoundGlyph;
      assert.deepStrictEqual(
        agrave.components.map((c) => [c.glyphIndex, c.matrix.e, c.matrix.f]),
        [
          [2, 0, 0],
          [4, 200, 0],
        ],
      );
    }
  });
});
