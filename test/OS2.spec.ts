import * as assert from "assert";
import { SeqStream } from "bytestreamjs";
import * as font from "../src";
// const font = require("./original");

context("OS2", () => {

  it("toStream/fromStream", () => {
    const table = new font.Tables.OS2({
      version: 3,
      xAvgCharWidth: 821,
      usWeightClass: 400,
      usWidthClass: 5,
      fsType: 8,
      ySubscriptXSize: 1434,
      ySubscriptYSize: 1331,
      ySubscriptXOffset: 0,
      ySubscriptYOffset: 293,
      ySuperscriptXSize: 1434,
      ySuperscriptYSize: 1331,
      ySuperscriptXOffset: 0,
      ySuperscriptYOffset: 928,
      yStrikeoutSize: 102,
      yStrikeoutPosition: 530,
      sFamilyClass: 261,
      panose: new Uint8Array([
        2, 2, 6, 3, 5,
        4, 5, 2, 3, 4
      ]),
      ulUnicodeRange1: 3758108415,
      ulUnicodeRange2: 3221256283,
      ulUnicodeRange3: 9,
      ulUnicodeRange4: 0,
      achVendID: 1414349600,
      fsSelection: 64,
      usFirstCharIndex: 32,
      usLastCharIndex: 65532,
      sTypoAscender: 1420,
      sTypoDescender: -442,
      sTypoLineGap: 307,
      usWinAscent: 1825,
      usWinDescent: 443,
      ulCodePageRange1: 1073742335,
      ulCodePageRange2: 4294901760,
      sxHeight: 916,
      sCapHeight: 1356,
      usDefaultChar: 0,
      usBreakChar: 32,
      usMaxContext: 21,
    });
    const stream = new SeqStream();
    table.toStream(stream);
    assert.strictEqual(Buffer.from(stream.buffer).toString("hex"), "00030335019000050008059a053300000125059a0533000003a000660212010502020603050405020304e0002effc000785b0000000900000000544d432000400020fffc058cfe460133072101bb400001ffffff00000394054c000000200015");
    const parsedTable = font.Tables.OS2.fromStream(new SeqStream({ buffer: stream.buffer }));
    assert.deepStrictEqual(parsedTable, table);
  });

});
