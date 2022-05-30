import * as assert from "assert";
import { SeqStream } from "bytestreamjs";
import * as font from "../src";

context("LOCA", () => {

  context("toStream/fromStream", () => {

    it("short", () => {
      const table = new font.Tables.LOCA({
        offsets: [0, 152, 152, 152, 864],
        indexToLocFormat: font.Tables.LOCAFormat.short,
      });
      const stream = new SeqStream();
      table.toStream(stream);
      assert.strictEqual(Buffer.from(stream.buffer).toString("hex"), "0000004c004c004c01b0");
      const parsedTable = font.Tables.LOCA.fromStream(new SeqStream({ buffer: stream.buffer }), font.Tables.LOCAFormat.short, 4);
      assert.deepStrictEqual(parsedTable, Object.assign(table, { offsets: [0, 152, 152, 152, 864] }));
    });

    it("long", () => {
      const table = new font.Tables.LOCA({
        offsets: [0, 152, 152, 152, 864],
        indexToLocFormat: font.Tables.LOCAFormat.long,
      });
      const stream = new SeqStream();
      table.toStream(stream);
      assert.strictEqual(Buffer.from(stream.buffer).toString("hex"), "0000000000000098000000980000009800000360");
      const parsedTable = font.Tables.LOCA.fromStream(new SeqStream({ buffer: stream.buffer }), font.Tables.LOCAFormat.long, 4);
      assert.deepStrictEqual(parsedTable, Object.assign(table, { offsets: [0, 152, 152, 152, 864] }));
    });

  });

});
