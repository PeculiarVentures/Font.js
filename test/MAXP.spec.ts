import * as assert from "assert";
import { SeqStream } from "bytestreamjs";
import * as font from "../src";
// const font = require("./original");

context("MAXP", () => {

  it("toStream/fromStream", () => {
    const table = new font.Tables.MAXP({
      version: 65536,
      numGlyphs: 4,
      maxPoints: 32,
      maxContours: 2,
      maxComponentPoints: 0,
      maxComponentContours: 0,
      maxZones: 2,
      maxTwilightPoints: 100,
      maxStorage: 256,
      maxFunctionDefs: 256,
      maxInstructionDefs: 256,
      maxStackElements: 3000,
      maxSizeOfInstructions: 596,
      maxComponentElements: 0,
      maxComponentDepth: 1,
    });
    const stream = new SeqStream();
    table.toStream(stream);
    assert.strictEqual(Buffer.from(stream.buffer).toString("hex"), "0001000000040020000200000000000200640100010001000bb8025400000001");
    const parsedTable = font.Tables.MAXP.fromStream(new SeqStream({ buffer: stream.buffer }));
    assert.deepStrictEqual(parsedTable, table);
  });

});
