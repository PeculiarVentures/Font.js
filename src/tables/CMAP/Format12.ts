import { SeqStream } from "bytestreamjs";
import { CMAPSubTable, type CMAPSubTableParameters, type GlyphMap } from "./CMAPSubTable";

export interface Format12Parameters extends CMAPSubTableParameters {
  language?: number;
  groups?: number[];
  codeToGID?: Map<number, number>;
  gidToCode?: Map<number, number[]>;
}

export class Format12 extends CMAPSubTable {
  protected onGetGlyphMap(): GlyphMap {
    return new Map(this.codeToGID);
  }

  /**
   * Format number is set to 12
   */
  public get format(): 12 {
    return 12;
  }

  public language: number;
  public groups: number[];
  public codeToGID: Map<number, number>;
  public gidToCode: Map<number, number[]>;

  constructor(parameters: Format12Parameters = {}) {
    super(parameters);

    this.language = parameters.language || 0;
    this.groups = parameters.groups || [];

    this.codeToGID = parameters.codeToGID || new Map();
    this.gidToCode = parameters.gidToCode || new Map();
  }

  static override get className() {
    return "Format12";
  }

  public static override fromStream(stream: SeqStream) {
    //#region Initial variables
    const codeToGID = new Map<number, number>();
    const gidToCode = new Map<number, number[]>();
    //#endregion
    //#region Read major information
    stream.getUint16(); // reserved
    stream.getUint32(); // length
    const language = stream.getUint32();
    const numGroups = stream.getUint32();
    //#endregion
    //#region Read information about groups
    for (let i = 0; i < numGroups; i++) {
      const startCharCode = stream.getUint32();
      const endCharCode = stream.getUint32();
      let startGlyphID = stream.getUint32();

      for (let j = startCharCode; j <= endCharCode; j++, startGlyphID++) {
        const code = gidToCode.get(startGlyphID) || [];
        code.push(j);

        gidToCode.set(startGlyphID, code);

        codeToGID.set(j, startGlyphID);
      }
    }
    //#endregion

    return new Format12({
      language,
      gidToCode,
      codeToGID,
    });
  }

  public override toStream(stream: SeqStream): boolean {
    // Group consecutive character codes that map to consecutive glyph IDs
    const groups: [startCharCode: number, endCharCode: number, startGlyphID: number][] = [];
    for (const [code, gid] of [...this.codeToGID].sort((a, b) => a[0] - b[0])) {
      const last = groups[groups.length - 1];
      if (last && code === last[1] + 1 && gid === last[2] + (code - last[0])) {
        last[1] = code;
      } else {
        groups.push([code, code, gid]);
      }
    }

    stream.appendUint16(this.format);
    stream.appendUint16(0); // reserved
    stream.appendUint32(16 + groups.length * 12); // length
    stream.appendUint32(this.language);
    stream.appendUint32(groups.length);
    for (const [startCharCode, endCharCode, startGlyphID] of groups) {
      stream.appendUint32(startCharCode);
      stream.appendUint32(endCharCode);
      stream.appendUint32(startGlyphID);
    }

    return true;
  }

  public override gid(code: number): number {
    return this.codeToGID.get(code) || 0;
  }

  public override code(gid: number) {
    return this.gidToCode.get(gid) || [];
  }
}
