import * as bsjs from "bytestreamjs";
import * as fs from "fs";
import { Font } from "../src";
import { NAME, NameIDs } from "../src/tables";

it.only("test", () => {
  const raw = fs.readFileSync("/Users/microshine/github/microshine/pdf/packages/font/fonts/ZapfDingbats.ttf");
  const font = Font.fromStream(new bsjs.SeqStream({ stream: new bsjs.ByteStream({ buffer: new Uint8Array(raw).buffer }) }));
  const name = font.tables.get(1851878757) as NAME;
  const glyphs = font.glyphs;
  console.log(glyphs);
  console.log(name.getName(NameIDs.fontSubFamilyName, { languageID: 1049 }));
  console.log(name.getName(NameIDs.copyright));

});
