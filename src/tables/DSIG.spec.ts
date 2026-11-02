import { SeqStream } from "bytestreamjs";
import * as pkijs from "pkijs";
import { assert, describe, it } from "vitest";
import { fixtureStream, readFixture } from "../../test/fixtures";
import { Font } from "../Font";
import { DSIG } from "./DSIG";

/**
 * Builds a DSIG table with one signature record (format 1).
 */
function dsigTable(signature: Uint8Array): SeqStream {
  const stream = new SeqStream();
  stream.appendUint32(1); // version
  stream.appendUint16(1); // numSignatures
  stream.appendUint16(1); // flags
  stream.appendUint32(1); // format
  stream.appendUint32(8 + signature.length); // length
  stream.appendUint32(20); // offset of the signature block
  stream.appendUint16(0); // reserved1
  stream.appendUint16(0); // reserved2
  stream.appendUint32(signature.length);
  stream.appendView(signature);

  return new SeqStream({ stream: stream.stream.slice(0, stream.length) });
}

describe("DSIG", () => {
  it("reads the CMS signature from FontJSTest-DSIG.ttf", () => {
    const font = Font.fromStream(fixtureStream("FontJSTest-DSIG.ttf"));
    const dsig = font.tables.get(DSIG.tag) as DSIG;
    const signature = readFixture("signature.der");

    assert.strictEqual(dsig.version, 1);
    assert.strictEqual(dsig.numSignatures, 1);
    assert.strictEqual(dsig.flags, 1);
    assert.lengthOf(dsig.signatureRecords, 1);

    const [record] = dsig.signatureRecords;
    assert.strictEqual(record.format, 1);
    assert.strictEqual(record.length, 8 + signature.length);
    assert.strictEqual(record.signatureBlock.signatureLength, signature.length);
    assert.deepStrictEqual(new Uint8Array(record.signatureBlock.signature), signature);

    assert.notProperty(record.signatureBlock, "signatureParsed");
  });

  it("parses the signature with pkijs as the README shows", () => {
    const font = Font.fromStream(fixtureStream("FontJSTest-DSIG.ttf"));
    const dsig = font.tables.get(DSIG.tag) as DSIG;

    // README "DSIG signatures" example
    const { signature } = dsig.signatureRecords[0].signatureBlock;
    const contentInfo = pkijs.ContentInfo.fromBER(signature);
    const signedData = new pkijs.SignedData({ schema: contentInfo.content });

    assert.strictEqual(contentInfo.contentType, pkijs.ContentInfo.SIGNED_DATA);
    assert.lengthOf(signedData.signerInfos, 1);
    assert.lengthOf(signedData.certificates!, 1);
    const certificate = signedData.certificates![0] as pkijs.Certificate;
    assert.strictEqual(certificate.subject.typesAndValues[0].value.valueBlock.value, "Font.js test signer");
  });

  it("keeps the raw bytes of a signature that isn't CMS", () => {
    const garbage = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const dsig = DSIG.fromStream(dsigTable(garbage));

    const [record] = dsig.signatureRecords;
    assert.strictEqual(record.signatureBlock.signatureLength, 4);
    assert.deepStrictEqual(new Uint8Array(record.signatureBlock.signature), garbage);
  });
});
