import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../../BaseClass";
import { CFFCharset } from "./CFFCharset";
import { CFFEncoding } from "./CFFEncoding";
import { CFFPrivateDICT } from "./CFFPrivateDICT";
import { CFFTopDICT } from "./CFFTopDICT";
import { INDEX } from "./IDX";
import { StringIndex } from "./StringIndex";

export interface CFFParameters {
  dicts?: CFFTopDICT[];
}

export class CFF extends BaseClass {
  public dicts: CFFTopDICT[];

  constructor(parameters: CFFParameters = {}) {
    super();

    this.dicts = parameters.dicts || [];
  }

  static get tag() {
    return 0x43464620;
  }

  static fromStream(stream: SeqStream) {
    //#region Read header information
    const headerBlock = stream.getBlock(4);

    const header = {
      major: headerBlock[0],
      minor: headerBlock[1],
      hdrSize: headerBlock[2],
      offSize: headerBlock[3]
    };
    //#endregion

    //#region Read possible "extension bytes"
    stream.getBlock(header.hdrSize - 4);
    //#endregion

    //#region Read "Name INDEX"
    INDEX.fromStream(stream);
    //#endregion

    //#region Read "Top DICT INDEX"
    const topDICTIndex = INDEX.fromStream(stream);
    //#endregion

    //#region Read "String INDEX"
    const stringIndex = StringIndex.fromStream(stream);
    //#endregion

    //#region Read "Global Subr INDEX"
    INDEX.fromStream(stream);
    //#endregion

    //#region Parse "Top DICT"
    const dicts: CFFTopDICT[] = [];

    for (const data of topDICTIndex.data) {
      const dict = CFFTopDICT.fromBuffer(data, stringIndex);

      if (dict.Private) {
        const buffer = stream.stream.buffer.slice(dict.Private.offset, dict.Private.offset + dict.Private.size);
        dict.PrivateDICT = CFFPrivateDICT.fromBuffer(buffer);
      }

      if ("CharStrings" in dict) {
        dict.CharStringsINDEX = INDEX.fromStream(new SeqStream({ stream: stream.stream.slice(dict.CharStrings) }));
        dict.CharsetParsed = CFFCharset.fromStream(
          new SeqStream({ stream: stream.stream.slice(dict.charset) }),
          dict.CharStringsINDEX.data.length,
          stringIndex
        );

        switch (dict.Encoding) {
          case 0:
            break;
          case 1:
            break;
          case 2:
            dict.EncodingParsed = CFFEncoding.fromStream(new SeqStream({ stream: stream.stream.slice(dict.Encoding) }));
            break;
          default:
        }
      }

      dicts.push(dict);
    }
    //#endregion

    return new CFF({ dicts });
  }

}
