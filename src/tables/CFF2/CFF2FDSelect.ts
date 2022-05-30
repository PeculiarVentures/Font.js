import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../../BaseClass";

export interface CFF2FDSelectParameters {
  format?: number;
  fds?: Uint8Array;
}

export class CFF2FDSelect extends BaseClass {

  public format: number;
  public fds: Uint8Array;

  constructor(parameters: CFF2FDSelectParameters = {}) {
    super();

    this.format = parameters.format || 0;
    this.fds = parameters.fds || new Uint8Array();
  }

  static fromStream(stream: SeqStream, nGlyphs = 0) {
    //#region Initial variables
    const parameters: CFF2FDSelectParameters = {};
    parameters.fds = new Uint8Array();
    //#endregion

    //#region Read infomration about format
    parameters.format = (stream.getBlock(1))[0];
    //#endregion

    switch (parameters.format) {
      case 0:
        parameters.fds = stream.getBlock(nGlyphs);
        break;
      case 3:
        {
          //#region Read information about ranges
          const nRanges = stream.getUint16();
          const range3: { first: number; fd: number; }[] = [];

          for (let i = 0; i < nRanges; i++) {
            const range = {
              first: stream.getUint16(),
              fd: (stream.getBlock(1))[0],
            };

            range3.push(range);
          }

          const sentinel = stream.getUint16();
          //#endregion

          //#region Transform ranges to FD information
          for (let i = 0; i < (range3.length - 1); i++) {
            for (let j = range3[i].first; j < range3[i + 1].first; j++)
              parameters.fds[j] = range3[i].fd;
          }

          for (let j = range3[range3.length - 1].first; j < sentinel; j++)
            parameters.fds[j] = range3[range3.length - 1].fd;
          //#endregion
        }

        break;
      case 4:
        {
          //#region Read information about ranges
          const nRanges = stream.getUint32();
          const range4 = [];

          for (let i = 0; i < nRanges; i++) {
            const range = {
              first: stream.getUint32(),
              fd: stream.getUint16(),
            };

            range4.push(range);
          }

          const sentinel = stream.getUint32();
          //#endregion

          //#region Transform ranges to FD information
          for (let i = 0; i < (range4.length - 1); i++) {
            for (let j = range4[i].first; j < range4[i + 1].first; j++)
              parameters.fds[j] = range4[i].fd;
          }

          for (let j = range4[range4.length - 1].first; j < sentinel; j++)
            parameters.fds[j] = range4[range4.length - 1].fd;
          //#endregion
        }

        break;
      default:
    }

    return new CFF2FDSelect(parameters);
  }

}
