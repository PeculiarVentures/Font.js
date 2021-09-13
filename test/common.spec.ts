import * as assert from "assert";
import { SeqStream } from "bytestreamjs";
import * as common from "../src/common";

context("common", () => {

  context("Fixed", () => {
    it("positive", () => {
      const readStream = new SeqStream({ hexstring: "000b8000" });

      const value = common.getFixed(readStream);
      assert.strictEqual(value, 11.5);

      const writeStream = new SeqStream();
      common.appendFixed(value, writeStream);

      assert.strictEqual(Buffer.from(writeStream.stream.view.subarray(0, 4)).toString("hex"), Buffer.from(readStream.stream.view).toString("hex"));
    });

    it("negative", () => {
      const readStream = new SeqStream({ hexstring: "fff38000" });

      const value = common.getFixed(readStream);
      assert.strictEqual(value, -12.5);

      const writeStream = new SeqStream();
      common.appendFixed(value, writeStream);

      assert.strictEqual(Buffer.from(writeStream.stream.view.subarray(0, 4)).toString("hex"), Buffer.from(readStream.stream.view).toString("hex"));
    });
  });

});
