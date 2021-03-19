import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../../BaseClass";
import { StandardStrings } from "./StandardStrings";
import { StringIndex } from "./StringIndex";

export interface CFFCharsetParameters {
  format?: number;
  charset?: string[];
}

export class CFFCharset extends BaseClass {
  public format: number;
  public charset?: string[];

  public constructor(parameters: CFFCharsetParameters = {}) {
    super();

    this.format = parameters.format || 0;

    if ("charset" in parameters)
      this.charset = parameters.charset;
  }

  /**
   * Convert SeqStream data to object
   * @param stream
   * @param numGlyphs
   * @param stringIndex
   */
  static fromStream(stream: SeqStream, numGlyphs = 0, stringIndex: StringIndex = new StringIndex()): CFFCharset {
    const parameters: CFFCharsetParameters = {};

    parameters.charset = [".notdef"];
    parameters.format = (stream.getBlock(1))[0];

    switch (parameters.format) {
      case 0:
        {
          for (let i = 0; i < (numGlyphs - 1); i++) {
            const value = stream.getUint16();
            parameters.charset.push((value <= 390) ? StandardStrings[value] : stringIndex.data[value - 391]);
          }
        }
        break;
      case 1:
        {
          while (parameters.charset.length <= (numGlyphs - 1)) {
            let value = stream.getUint16();
            const count = (stream.getBlock(1))[0];

            for (let j = 0; j <= count; j++, value++)
              parameters.charset.push((value <= 390) ? StandardStrings[value] : stringIndex.data[value - 391]);
          }
        }
        break;
      case 2:
        {
          while (parameters.charset.length <= (numGlyphs - 1)) {
            let value = stream.getUint16();
            const count = stream.getUint16();

            for (let j = 0; j <= count; j++, value++)
              parameters.charset.push((value <= 390) ? StandardStrings[value] : stringIndex.data[value - 391]);
          }
        }
        break;
      default:
    }

    return new CFFCharset(parameters);
  }

}