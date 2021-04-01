import * as assert from "assert";
import { SeqStream } from "bytestreamjs";
import * as font from "../src";
import { CMAPPlatformIDs } from "../src/tables/CMAP";
// const font = require("fontjs");

context("CMAP", () => {

  context("Format0", () => {

    it("toStream/fromStream", () => {
      const cmap = new font.Tables.CMAP({
        subTables: [
          new font.Tables.Format0({
            platformID: CMAPPlatformIDs.Windows,
            platformSpecificID: 2,
            language: 1,
            glyphIndexArray: [1, 2, 3, 4, 5, 6],
          })
        ],
      });
      const stream = new SeqStream();
      cmap.toStream(stream);
      assert.strictEqual(Buffer.from(stream.buffer).toString("hex"), "00000001000300020000000c000001060001010203040506");
      const parsedCmap = font.Tables.CMAP.fromStream(new SeqStream({ buffer: stream.buffer }));
      assert.strictEqual(parsedCmap.version, 0);
      assert.strictEqual(parsedCmap.subTables.length, 1);
      const format0 = parsedCmap.subTables[0];
      if (format0 instanceof font.Tables.Format0) {
        assert.strictEqual(format0.platformID, 3);
        assert.strictEqual(format0.platformSpecificID, 2);
        assert.strictEqual(format0.format, 0);
        assert.strictEqual(format0.language, 1);
        assert.deepStrictEqual(format0.glyphIndexArray.length, 256);
        assert.deepStrictEqual(format0.glyphIndexArray.filter((o: number) => o !== undefined), [1, 2, 3, 4, 5, 6]);
      } else {
        assert.fail("Wrong format of subTable");
      }
    });

  });

  context("Format4", () => {

    const cmap = new font.Tables.CMAP({
      subTables: [
        new font.Tables.Format4({
          platformID: CMAPPlatformIDs.Windows,
          platformSpecificID: 2,
          language: 1,
          segments: [
            {
              codeToGID: new Map([
                [1, 10],
                [2, 20],
                [3, 30],
              ]),
              gidToCode: new Map([
                [10, 1],
                [20, 2],
                [30, 3],
              ]),
            },
            {
              codeToGID: new Map([
                [4, 40],
                [5, 50],
                [6, 60],
              ]),
              gidToCode: new Map([
                [40, 4],
                [50, 5],
                [60, 6],
              ]),
              delta: 2,
              offset: 1,
            }
          ]
        })
      ],
    });

    it("toStream/fromStream", () => {
      const stream = new SeqStream();
      cmap.toStream(stream);
      assert.strictEqual(Buffer.from(stream.buffer).toString("hex"), "00000001000300020000000c0004002c00010004000400010000000300060000000100040000000000040008000a0014001e00280032003c");
      const parsedCmap = font.Tables.CMAP.fromStream(new SeqStream({ buffer: stream.buffer }));
      assert.strictEqual(parsedCmap.version, 0);
      assert.strictEqual(parsedCmap.subTables.length, 1);
      const format4 = parsedCmap.subTables[0];
      if (format4 instanceof font.Tables.Format4) {
        assert.strictEqual(format4.platformID, 3);
        assert.strictEqual(format4.platformSpecificID, 2);
        assert.strictEqual(format4.format, 4);
        assert.strictEqual(format4.language, 1);

        const segment0 = format4.segments[0];
        assert.strictEqual(segment0.delta, 0);
        assert.strictEqual(segment0.offset, 4);

        const segment1 = format4.segments[1];
        assert.strictEqual(segment1.delta, 0);
        assert.strictEqual(segment1.offset, 8);
      } else {
        assert.fail("Wrong format of subTable");
      }
    });

    it("gid/code", () => {
      const format4 = cmap.subTables[0];
      if (format4 instanceof font.Tables.Format4) {
        // exists
        assert.strictEqual(format4.gid(1), 10);
        assert.deepStrictEqual(format4.code(10), [1]);

        // does not exist
        assert.strictEqual(format4.gid(100), 0);
        assert.deepStrictEqual(format4.code(100), []);
      } else {
        assert.fail("Wrong format of subTable");
      }
    });

  });

});