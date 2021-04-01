import * as assert from "assert";
import { SeqStream } from "bytestreamjs";
import * as font from "../src";

context("HHEA", () => {

  it("toStream/fromStream", () => {
    const table = new font.Tables.HHEA({
      version: 65536,
      ascent: 1387,
      descent: 0,
      lineGap: 87,
      advanceWidthMax: 1593,
      minLeftSideBearing: 0,
      minRightSideBearing: 0,
      xMaxExtent: 1740,
      caretSlopeRise: 0,
      caretSlopeRun: 0,
      caretOffset: 0,
      reserved1: 0,
      reserved2: 0,
      reserved3: 0,
      reserved4: 0,
      metricDataFormat: 0,
      numOfLongHorMetrics: 4
    });
    const stream = new SeqStream();
    table.toStream(stream);
    assert.strictEqual(Buffer.from(stream.buffer).toString("hex"), "00010000056b0000005706390000000006cc000000000000000000000000000000000004");
    const parsedTable = font.Tables.HHEA.fromStream(new SeqStream({ buffer: stream.buffer }));
    assert.deepStrictEqual(parsedTable, table);
  });

});
