import * as assert from "assert";
import { SeqStream } from "bytestreamjs";
import * as fontjs from "../src";
// const fontjs = require("./original");

context("Font", () => {
  const fontB64 = "dHJ1ZQAJAIAAAwAQT1MvMhdvWHYAAACcAAAAYGNtYXAAVQELAAAA/AAAADxnbHlmImoOiwAAATgAAANgaGVhZB3c3pEAAASYAAAANmhoZWEMjwY9AAAE0AAAACRobXR4DgABLAAABPQAAAAQbG9jYQH8AJgAAAUEAAAACm1heHANIwR3AAAFEAAAACBwb3N0/yQAZAAABTAAAAAgAAMDNQGQAAUACAWaBTMAAAElBZoFMwAAA6AAZgISAQUCAgYDBQQFAgME4AAu/8AAeFsAAAAJAAAAAFRNQyAAQAAg//wFjP5GATMHIQG7QAAB////AAADlAVMAAAAIAAVAAAAAQADAAEAAAAMAAQAMAAAAAgACAACAAAAIABBAKD//wAAACAAQQCg////4v/C/2IAAQAAAAAAAAAAAAIBHAAABRwFAAADAAcAbLCFK1ixAgG7Ar4ABgAHAr+yAAUEuAK+tAMACgcEuAK+tQEAGQgGBb8CvgACAAMBKQAJAWsBXgAYKxD2PP08ThD0PE39PAA/PP08EPw8/TwxMBuxAAS4B9ezbAABB7gH17FsAQAYLysvKzAxWWERIRFlIREhARwEAPwgA8D8QAUA+wAgBMAAAAAAAgAQAAAFsAVrABwAHwJUsIUrWLECAkNUWEASAR8eAh4dABweHAAdHwEeHAIUvgPiABcD4gAHA+IACgPiQBcIAhweAw8IHBYdAB9wAYABAgEBCA8CCAAvPxI5L13N0M0vLxESFzkQ7e3u7AEvLy8vLy8vEH2HxMQQh8TEMTAbQBsIDg8PDRAKHgkfUCEGFQ8TEBoRGhsbHBgdBiG4/8CyJTUhuP/AszBYNCG4/8CzKy40Ibj/wLIpNSG4/8CzICY0Ibj/wLMaHjQhuP/Ashc1Ibj/wLIVNSG4/8BAlxATNA0PCxAKHjkPSg9GEEkeTyFZD1cQVRRYHmoPZxBoHnYQgASHDooPhxCHEokeiB+bD5sQmRGbHrkPuRC9Grkeyw/KEMgdyh7bD9gQ6w/oEOge+Q/4EPkd+R4sCQ9LGwIfHgEBHx4CAB0eHhwJDgobCRYcFxsWCAIHGwgVERQbFXgeDxAgEB4cHCIREBQRcBEBERAPDg64AslAEQIeFAICHh8dpQAAcAGAAQIBuAG1QAwIEA8DFRYWCAgJCBy4AfpACQ8RARECpQ5AEbgCMLNPHgEeuALsQA4gQA5QDvAOAw6nIGuKGCsQ9l0ZGv1d7RgaEO0QXe0APzwQPBA8PzwQ9F08EP08hw4uKwV9EMSHXQ4uGCuHBX3EKxgAEO0BEMAAEO0BEMAAEO0BEMAAEO0BEMCHEH3EPAc8PAc8MTABcV0rKysrKysrKysBcl1ZG7ceDx0dCQ8fAbgH7UAMbB8fCQ8DBxcUAwkKuAPis2wWCQgAGD8zKxcyPxI5LysREjkvETkwMVlBIQcGFRQWFxUhNTY3NjcBMwEWFhcVITU2NjU0J0MLAQOp/fNcIjti/lVVGTM+Ad0jAdg5XVP96VE5KG7m7AHG1k8nHy8HJSUPGDCTBFz7mIhRBSUlBC4hLF8BDQIk/dwAAAAAAAEAAAABAACdztkpXw889QADCAAAAAAA3ItKFAAAAADci0oUAAAAAAWwBWsAAAAJAAIAAAAAAAAAAQAABWsAAABXBjkAAAAABswAAAAAAAAAAAAAAAAAAAAAAAQGOQEcAAAAAAIAAAAFxwAQAAAATABMAEwBsAAAAAEAAAAEACAAAgAAAAAAAgBkAQABAAEAC7gCVAAAAAEAAwAAAAAAAP8hAGQAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

  it("toStream/fromStream", () => {
    const stream = new SeqStream({
      hexstring: Buffer.from(fontB64, "base64").toString("hex"),
    });
    const font = fontjs.Font.fromStream(stream);
    const os = new SeqStream();
    font.toStream(os);
    assert.strictEqual(Buffer.from(os.buffer).toString("base64"), fontB64);
  });

  context("Find Glyph", () => {
    it("Glyph found", () => {
      const stream = new SeqStream({
        hexstring: Buffer.from(fontB64, "base64").toString("hex"),
      });
      const font = fontjs.Font.fromStream(stream);
      const glyph = font.findUnicodeGlyph(" ");
      assert(glyph);
    });

    it("Glyph not found", () => {
      const stream = new SeqStream({
        hexstring: Buffer.from(fontB64, "base64").toString("hex"),
      });
      const font = fontjs.Font.fromStream(stream);
      const glyph = font.findUnicodeGlyph("D");
      assert.strictEqual(glyph, null);
    });
  });

});
