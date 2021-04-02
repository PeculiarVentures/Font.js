import * as assert from "assert";
import { SeqStream } from "bytestreamjs";
import * as font from "../src";

context("GLYF", () => {

  it("toStream/fromStream", () => {
    const table = new font.Tables.GLYF({
      glyphs: [
        new font.Tables.EmptyGlyph(),
        new font.Tables.SimpleGlyph({
          numberOfContours: 2,
          xMin: 284,
          yMin: 0,
          xMax: 1308,
          yMax: 1280,
          endPtsOfContours: [3, 7],
          instructions: [
            176, 133, 43, 88, 177, 2, 1, 187, 2, 190, 0, 6,
            0, 7, 2, 191, 178, 0, 5, 4, 184, 2, 190, 180,
            3, 0, 10, 7, 4, 184, 2, 190, 181, 1, 0, 25,
            8, 6, 5, 191, 2, 190, 0, 2, 0, 3, 1, 41,
            0, 9, 1, 107, 1, 94, 0, 24, 43, 16, 246, 60,
            253, 60, 78, 16, 244, 60, 77, 253, 60, 0, 63, 60,
            253, 60, 16, 252, 60, 253, 60, 49, 48, 27, 177, 0,
            4, 184, 7, 215, 179, 108, 0, 1, 7, 184, 7, 215,
            177, 108, 1, 0, 1, 2, 3, 4, 5, 6, 7, 8
          ],
          flags: [
            97, 17, 33, 17,
            101, 33, 17, 33
          ],
          xCoordinates: [
            284, 284, 1308,
            1308, 316, 1276,
            1276, 316
          ],
          yCoordinates: [
            0, 1280, 1280,
            0, 32, 32,
            1248, 1248
          ]
        }),
      ]
    });
    const stream = new SeqStream();
    table.toStream(stream);
    assert.strictEqual(Buffer.from(stream.buffer).toString("hex"), "0002011c0000051c050000030007006cb0852b58b10201bb02be0006000702bfb2000504b802beb403000a0704b802beb5010019080605bf02be0002000301290009016b015e00182b10f63cfd3c4e10f43c4dfd3c003f3cfd3c10fc3cfd3c31301bb10004b807d7b36c000107b807d7b16c010001020304050607086111211165211121011c0400fc2003c0fc400500fb002004c0000000");
    const parsedTable = font.Tables.GLYF.fromStream(new SeqStream({ buffer: stream.buffer }), 2, new font.Tables.LOCA({
      offsets: [0, 0, 150],
    }));
    assert.strictEqual(parsedTable.glyphs[0] instanceof font.Tables.EmptyGlyph, true);
    assert.strictEqual(parsedTable.glyphs[1] instanceof font.Tables.SimpleGlyph, true);
  });

  context("EmptyGlyph", () => {

    it("encode/decode", () => {
      const glyph = new font.Tables.EmptyGlyph({
        numberOfContours: 0,
        xMin: 0,
        yMin: 0,
        xMax: 0,
        yMax: 0
      });
      const stream = new SeqStream();
      glyph.encode(stream);
      assert.strictEqual(Buffer.from(stream.buffer).toString("hex"), "");
      const parsedGlyph = new font.Tables.EmptyGlyph({
        stream: new SeqStream({ buffer: stream.buffer }),
      });
      glyph.stream = new SeqStream();
      parsedGlyph.stream = new SeqStream();
      assert.deepStrictEqual(parsedGlyph, glyph);
    });

  });

  context("SimpleGlyph", () => {

    it("encode/decode", () => {
      const glyph = new font.Tables.SimpleGlyph({
        numberOfContours: 2,
        xMin: 284,
        yMin: 0,
        xMax: 1308,
        yMax: 1280,
        endPtsOfContours: [3, 7],
        instructions: [
          176, 133, 43, 88, 177, 2, 1, 187, 2, 190, 0, 6,
          0, 7, 2, 191, 178, 0, 5, 4, 184, 2, 190, 180,
          3, 0, 10, 7, 4, 184, 2, 190, 181, 1, 0, 25,
          8, 6, 5, 191, 2, 190, 0, 2, 0, 3, 1, 41,
          0, 9, 1, 107, 1, 94, 0, 24, 43, 16, 246, 60,
          253, 60, 78, 16, 244, 60, 77, 253, 60, 0, 63, 60,
          253, 60, 16, 252, 60, 253, 60, 49, 48, 27, 177, 0,
          4, 184, 7, 215, 179, 108, 0, 1, 7, 184, 7, 215,
          177, 108, 1, 0, 1, 2, 3, 4, 5, 6, 7, 8
        ],
        flags: [
          97, 17, 33, 17,
          101, 33, 17, 33
        ],
        xCoordinates: [
          284, 284, 1308,
          1308, 316, 1276,
          1276, 316
        ],
        yCoordinates: [
          0, 1280, 1280,
          0, 32, 32,
          1248, 1248
        ]
      });
      const stream = new SeqStream();
      glyph.encode(stream);
      assert.strictEqual(Buffer.from(stream.buffer).toString("hex"), "0002011c0000051c050000030007006cb0852b58b10201bb02be0006000702bfb2000504b802beb403000a0704b802beb5010019080605bf02be0002000301290009016b015e00182b10f63cfd3c4e10f43c4dfd3c003f3cfd3c10fc3cfd3c31301bb10004b807d7b36c000107b807d7b16c010001020304050607086111211165211121011c0400fc2003c0fc400500fb002004c000");
      const parsedGlyph = new font.Tables.SimpleGlyph({
        stream: new SeqStream({ buffer: stream.buffer }),
      });
      glyph.stream = new SeqStream();
      parsedGlyph.stream = new SeqStream();
      assert.deepStrictEqual(parsedGlyph, glyph);
    });

  });

});
