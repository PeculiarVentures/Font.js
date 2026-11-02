import { SeqStream } from "bytestreamjs";
import { FontTable } from "../Table";

export interface SignatureBlock {
  reserved1: number;
  reserved2: number;
  signatureLength: number;
  /**
   * PKCS#7 / CMS `SignedData` (DER) for format 1 signatures. fontjs doesn't
   * parse it; use a CMS library such as pkijs, see the README.
   */
  signature: Uint8Array<ArrayBuffer>;
}

export interface SignatureRecord {
  format: number;
  length: number;
  offset: number;
  signatureBlock: SignatureBlock;
}

export interface DSIGParameters {
  version?: number;
  numSignatures?: number;
  flags?: number;
  signatureRecords?: SignatureRecord[];
}
export class DSIG extends FontTable {
  public version: number;
  public numSignatures: number;
  public flags: number;
  public signatureRecords: SignatureRecord[];

  constructor(parameters: DSIGParameters = {}) {
    super();

    this.version = parameters.version || 0x00000001;
    this.numSignatures = parameters.numSignatures || 0;
    this.flags = parameters.flags || 0;
    this.signatureRecords = parameters.signatureRecords || [];
  }

  static override get tag() {
    return 0x44534947;
  }

  static override fromStream(stream: SeqStream) {
    const version = stream.getUint32();
    const numSignatures = stream.getUint16();
    const flags = stream.getUint16();
    const signatureRecords: SignatureRecord[] = [];

    for (let i = 0; i < numSignatures; i++) {
      const signatureRecord = {
        format: stream.getUint32(),
        length: stream.getUint32(),
        offset: stream.getUint32(),
      } as SignatureRecord;

      const signatureBlockStream = new SeqStream({ stream: stream.stream.slice(signatureRecord.offset, signatureRecord.offset + signatureRecord.length) });

      signatureRecord.signatureBlock = {} as SignatureBlock;

      signatureRecord.signatureBlock.reserved1 = signatureBlockStream.getUint16();
      signatureRecord.signatureBlock.reserved2 = signatureBlockStream.getUint16();
      signatureRecord.signatureBlock.signatureLength = signatureBlockStream.getUint32();
      signatureRecord.signatureBlock.signature = new Uint8Array(signatureBlockStream.getBlock(signatureRecord.signatureBlock.signatureLength));

      signatureRecords.push(signatureRecord);
    }

    return new DSIG({
      version,
      numSignatures,
      flags,
      signatureRecords,
    });
  }
}
