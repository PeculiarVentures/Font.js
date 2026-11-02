import { SeqStream } from "bytestreamjs";
import { assert, describe, it } from "vitest";
import { NAME, NameIDs, type NAMERecord } from "./NAME";

function record(platformID: number, platformSpecificID: number, nameID: number, value: number[]): NAMERecord {
  return { platformID, platformSpecificID, languageID: platformID === 3 ? 0x409 : 0, nameID, value };
}

function utf16be(text: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    bytes.push(code >> 8, code & 0xff);
  }

  return bytes;
}

describe("NAME", () => {
  it("decodes Unicode and Windows Unicode records as UTF-16BE, surrogate pairs included", () => {
    const text = "Font 😀 Ω";
    for (const [platformID, platformSpecificID] of [
      [0, 3],
      [3, 1],
      [3, 10],
    ]) {
      const name = new NAME({ nameRecords: [record(platformID, platformSpecificID, NameIDs.fullFontName, utf16be(text))] });
      assert.strictEqual(name.getName(NameIDs.fullFontName), text);
    }
  });

  it("decodes other platforms one character per byte", () => {
    // Mac Roman 0x8E is "é"; bytes are mapped to U+0000..U+00FF without a Mac Roman table (as in fontjs 3)
    const name = new NAME({ nameRecords: [record(1, 0, NameIDs.fontFamilyName, [0x46, 0x8e, 0xa9])] });
    assert.strictEqual(name.getName(NameIDs.fontFamilyName), "F\u008e©");
  });

  it("throws RangeError for a UTF-16 record with an odd byte length (as in fontjs 3)", () => {
    const name = new NAME({ nameRecords: [record(3, 1, NameIDs.fontFamilyName, [0x00, 0x41, 0x00])] });
    assert.throws(() => name.getName(NameIDs.fontFamilyName), RangeError);
  });

  it("returns null for a missing name and honours the record filter", () => {
    const name = new NAME({
      nameRecords: [record(1, 0, NameIDs.fontFamilyName, [0x4d, 0x61, 0x63]), record(3, 1, NameIDs.fontFamilyName, utf16be("Win"))],
    });

    assert.isNull(name.getName(NameIDs.copyright));
    assert.strictEqual(name.getName(NameIDs.fontFamilyName, { platformID: 1 }), "Mac");
    assert.strictEqual(name.getName(NameIDs.fontFamilyName, { platformID: 3 }), "Win");
  });

  it("round-trips records through toStream/fromStream", () => {
    const name = new NAME({ nameRecords: [record(3, 1, NameIDs.fontFamilyName, utf16be("FontJS"))] });
    const stream = new SeqStream();
    name.toStream(stream);

    const parsed = NAME.fromStream(new SeqStream({ stream: stream.stream.slice(0, stream.length) }));
    assert.strictEqual(parsed.getName(NameIDs.fontFamilyName), "FontJS");
  });
});
