import * as assert from "assert";
import { SeqStream } from "bytestreamjs";
import * as font from "../src";

context("HMTX", () => {

  it("toStream/fromStream", () => {
    const table = new font.Tables.HMTX({
      hMetrics: [
        { advanceWidth: 1593, leftSideBearing: 284 },
        { advanceWidth: 0, leftSideBearing: 0 },
        { advanceWidth: 512, leftSideBearing: 0 },
        { advanceWidth: 1479, leftSideBearing: 16 }
      ],
      leftSideBearings: [1, 2, 3]
    });
    const stream = new SeqStream();
    table.toStream(stream);
    assert.strictEqual(Buffer.from(stream.buffer).toString("hex"), "0639011c000000000200000005c70010000100020003");
    const parsedTable = font.Tables.HMTX.fromStream(new SeqStream({ buffer: stream.buffer }), 7, 4);
    assert.deepStrictEqual(parsedTable, table);
  });

});
