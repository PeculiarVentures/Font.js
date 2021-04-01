import * as assert from "assert";
import { SeqStream } from "bytestreamjs";
import * as font from "../src";

context("HEAD", () => {

  it("toStream/fromStream", () => {
    const table = new font.Tables.HEAD({
      version: 65536,
      fontRevision: 65536,
      checkSumAdjustment: 0,
      magicNumber: 1594834165,
      flags: 3,
      unitsPerEm: 2048,
      created: new Date("2021-04-01T09:59:48.000Z"),
      modified: new Date("2021-04-01T09:59:48.000Z"),
      xMin: 0,
      yMin: 0,
      xMax: 1456,
      yMax: 1387,
      macStyle: 0,
      lowestRecPPEM: 9,
      fontDirectionHint: 2,
      indexToLocFormat: 0,
      glyphDataFormat: 0
    });
    const stream = new SeqStream();
    table.toStream(stream);
    assert.strictEqual(Buffer.from(stream.buffer).toString("hex"), "0001000000010000000000005f0f3cf50003080000000000dc8b4a1400000000dc8b4a140000000005b0056b00000009000200000000");
    const parsedTable = font.Tables.HEAD.fromStream(new SeqStream({ buffer: stream.buffer }));
    assert.deepStrictEqual(parsedTable, table);
  });

});
