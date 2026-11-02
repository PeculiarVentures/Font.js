import { SeqStream } from "bytestreamjs";
import { assert, describe, it } from "vitest";
import { fixtureStream } from "../test/fixtures";
import * as fontjs from ".";

const { Tables } = fontjs;

function parse(): fontjs.Font {
  return fontjs.Font.fromStream(fixtureStream("FontJSTest-Regular.ttf"));
}

function encode(font: fontjs.Font): SeqStream {
  const stream = new SeqStream();
  assert.isTrue(font.toStream(stream));

  return stream;
}

function reparse(stream: SeqStream): fontjs.Font {
  return fontjs.Font.fromStream(new SeqStream({ stream: stream.stream.slice(0, stream.length) }));
}

function tagName(tag: number): string {
  return String.fromCharCode(tag >>> 24, (tag >>> 16) & 0xff, (tag >>> 8) & 0xff, tag & 0xff);
}

describe("public API", () => {
  it("exports the documented entry points", () => {
    assert.isFunction(fontjs.Font);
    assert.isFunction(fontjs.FontCollection);
    assert.isFunction(fontjs.BaseClass);
    assert.isFunction(fontjs.Matrix);
    assert.isFunction(fontjs.Tables.NAME);
    assert.isFunction(fontjs.getLongDateTime);
    assert.strictEqual(fontjs.ScalerTypes.true, 0x74727565);
  });
});

describe("Font with the FontJSTest-Regular.ttf fixture", () => {
  it("parses every table without warnings", () => {
    const font = parse();

    assert.deepStrictEqual(font.warnings, []);
    assert.strictEqual(font.scalerType, 0x00010000);
    assert.sameMembers([...font.tables.keys()].map(tagName), ["OS/2", "cmap", "glyf", "head", "hhea", "hmtx", "loca", "maxp", "name", "post"]);
  });

  it("reads head", () => {
    const head = parse().tables.get(Tables.HEAD.tag) as fontjs.Tables.HEAD;

    assert.strictEqual(head.unitsPerEm, 1000);
    assert.strictEqual(head.magicNumber, 0x5f0f3cf5);
    assert.strictEqual(head.fontRevision, 0x00010000); // 16.16 Fixed 1.0
    assert.strictEqual(head.created.toISOString(), "2024-01-01T00:00:00.000Z");
    assert.strictEqual(head.modified.toISOString(), "2024-01-01T00:00:00.000Z");
    assert.deepStrictEqual([head.xMin, head.yMin, head.xMax, head.yMax], [0, 0, 600, 950]);
  });

  it("reads name records through NAME.getName", () => {
    const name = parse().tables.get(Tables.NAME.tag) as fontjs.Tables.NAME;

    assert.strictEqual(name.getName(Tables.NameIDs.fontFamilyName), "FontJS Test");
    assert.strictEqual(name.getName(Tables.NameIDs.fontSubFamilyName), "Regular");
    assert.strictEqual(name.getName(Tables.NameIDs.fullFontName), "FontJS Test Regular");
    assert.strictEqual(name.getName(Tables.NameIDs.postScriptFontName), "FontJSTest-Regular");
    assert.strictEqual(name.getName(Tables.NameIDs.version), "Version 1.000");
    // Mac Roman record (platform 1) and Windows UTF-16BE record (platform 3) decode to the same text
    assert.strictEqual(name.getName(Tables.NameIDs.fontFamilyName, { platformID: 1 }), "FontJS Test");
    assert.strictEqual(name.getName(Tables.NameIDs.fontFamilyName, { platformID: 3 }), "FontJS Test");
  });

  it("reads OS/2, hhea and post", () => {
    const font = parse();
    const os2 = font.tables.get(Tables.OS2.tag) as fontjs.Tables.OS2;
    const hhea = font.tables.get(Tables.HHEA.tag) as fontjs.Tables.HHEA;
    const post = font.tables.get(Tables.POST.tag) as fontjs.Tables.POST;

    assert.strictEqual(os2.sTypoAscender, 800);
    assert.strictEqual(os2.sTypoDescender, -200);
    assert.strictEqual(os2.usWinAscent, 950);
    assert.strictEqual(os2.usWinDescent, 200);
    assert.strictEqual(hhea.ascent, 800);
    assert.strictEqual(hhea.descent, -200);
    assert.strictEqual(hhea.advanceWidthMax, 600);
    assert.strictEqual(post.version, 0x00020000);
    assert.strictEqual(post.underlinePosition, -100);
    assert.strictEqual(post.underlineThickness, 50);
    assert.strictEqual(font.unitsPerEm, 1000);
    assert.strictEqual(font.italicAngle, 0);
  });

  it("decodes simple, empty and compound glyphs with metrics", () => {
    const font = parse();
    const glyphs = font.glyphs;

    assert.strictEqual(font.numGlyphs, 6);
    assert.deepStrictEqual(
      glyphs.map((glyph) => (glyph.constructor as typeof fontjs.Tables.Glyph).className),
      ["SimpleGlyph", "EmptyGlyph", "SimpleGlyph", "SimpleGlyph", "SimpleGlyph", "CompoundGlyph"],
    );
    assert.deepStrictEqual(
      glyphs.map((glyph) => glyph.hAdvanceWidth),
      [500, 250, 600, 560, 300, 600],
    );

    const agrave = glyphs[5] as fontjs.Tables.CompoundGlyph;
    assert.deepStrictEqual(
      agrave.components.map((component) => component.glyphIndex),
      [2, 4],
    );
  });

  it("looks up glyphs through cmap", () => {
    const font = parse();
    const cmap = font.tables.get(Tables.CMAP.tag) as fontjs.Tables.CMAP;

    assert.deepStrictEqual(
      cmap.subTables.map((subTable) => [subTable.platformID, subTable.platformSpecificID, subTable.format]),
      [
        [0, 3, 4],
        [3, 1, 4],
        [3, 10, 12],
      ],
    );
    assert.strictEqual(font.findUnicodeGlyph("A")?.index, 2);
    assert.strictEqual(font.findUnicodeGlyph(0xc0)?.index, 5);
    assert.strictEqual(font.findUnicodeGlyph("Z"), null);
    assert.strictEqual(cmap.gid(0x42), 3);
    assert.deepStrictEqual(cmap.code(2), [0x41]);
    assert.deepStrictEqual(font.stringToGIDsArray("AB A"), [2, 3, 1]);
  });

  it("round-trips every table through toStream", () => {
    const font = parse();
    const first = encode(font);
    const again = reparse(first);

    assert.deepStrictEqual(again.warnings, []);
    assert.sameMembers([...again.tables.keys()], [...font.tables.keys()]);
    assert.strictEqual((again.tables.get(Tables.NAME.tag) as fontjs.Tables.NAME).getName(Tables.NameIDs.postScriptFontName), "FontJSTest-Regular");
    assert.strictEqual((again.tables.get(Tables.HEAD.tag) as fontjs.Tables.HEAD).unitsPerEm, 1000);
    assert.strictEqual(again.findUnicodeGlyph("B")?.index, 3);
    assert.deepStrictEqual(
      again.glyphs.map((glyph) => [glyph.xMin, glyph.yMin, glyph.xMax, glyph.yMax]),
      font.glyphs.map((glyph) => [glyph.xMin, glyph.yMin, glyph.xMax, glyph.yMax]),
    );

    // Encoding is stable: a second pass produces the same bytes
    const second = encode(again);
    assert.deepStrictEqual(new Uint8Array(second.buffer), new Uint8Array(first.buffer));
  });

  it("round-trips a cmap format 12 subtable", () => {
    const font = parse();
    const again = reparse(encode(font));

    const cmap = again.tables.get(Tables.CMAP.tag) as fontjs.Tables.CMAP;
    const format12 = cmap.subTables[2] as fontjs.Tables.Format12;
    assert.strictEqual(format12.format, 12);
    assert.strictEqual(format12.gid(0x1f170), 2);
    assert.strictEqual(format12.gid(0x41), 2);
    assert.strictEqual(format12.gid(0x5a), 0);
    assert.deepStrictEqual(format12.code(2), [0x41, 0x1f170]);
    assert.deepStrictEqual(format12.getGlyphMap(), (font.tables.get(Tables.CMAP.tag) as fontjs.Tables.CMAP).subTables[2].getGlyphMap());
    assert.strictEqual(format12.getGlyphMap().get(0xc0), 5);
  });

  it("subsets the font the way @peculiar/pdf-font does", () => {
    const font = parse();
    // subset() adds the missing and null glyphs itself
    const gids = [...new Set([..."BA"].map((char) => font.findUnicodeGlyph(char)!.index))];

    const head = font.tables.get(Tables.HEAD.tag) as fontjs.Tables.HEAD;
    const hhea = font.tables.get(Tables.HHEA.tag) as fontjs.Tables.HHEA;
    const post = font.tables.get(Tables.POST.tag) as fontjs.Tables.POST;
    post.glyphNameIndex = [];
    post.names = [];

    const subset = font.subset({
      tables: new Map<number, fontjs.BaseClass>([
        [Tables.OS2.tag, font.tables.get(Tables.OS2.tag)],
        [Tables.POST.tag, post],
        [Tables.NAME.tag, font.tables.get(Tables.NAME.tag)],
      ]),
      glyphIndexes: gids,
      fontValues: {
        unitsPerEm: head.unitsPerEm,
        ascent: hhea.ascent,
        descent: hhea.descent,
        lineGap: hhea.lineGap,
      },
      cmaps: [{ format: 4, language: 0, platformID: 3, platformSpecificID: 1 }],
      cmapLanguage: 0,
    });

    const again = reparse(encode(subset));

    assert.strictEqual(again.numGlyphs, 4);
    assert.strictEqual(again.findUnicodeGlyph("B")?.hAdvanceWidth, 560);
    assert.strictEqual(again.findUnicodeGlyph("A")?.hAdvanceWidth, 600);
    assert.isNull(again.findUnicodeGlyph(0xc0));
    assert.strictEqual((again.tables.get(Tables.NAME.tag) as fontjs.Tables.NAME).getName(Tables.NameIDs.fontFamilyName), "FontJS Test");
  });
});
