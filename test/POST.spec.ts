import * as assert from "assert";
import { SeqStream } from "bytestreamjs";
import * as font from "../src";

context("POST", () => {

  it("toStream/fromStream", () => {
    const table = new font.Tables.POST({
      version: 196608,
      italicAngle: 0,
      underlinePosition: -223,
      underlineThickness: 100,
      isFixedPitch: 0,
      minMemType42: 0,
      maxMemType42: 0,
      minMemType1: 0,
      maxMemType1: 0
    });
    const stream = new SeqStream();
    table.toStream(stream);
    assert.strictEqual(Buffer.from(stream.buffer).toString("hex"), "0003000000000000ff2100640000000000000000000000000000000000000000");
    const parsedTable = font.Tables.POST.fromStream(new SeqStream({ buffer: stream.buffer }));
    assert.deepStrictEqual(parsedTable, table);
  });

});
