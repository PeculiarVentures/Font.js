<h1 align="center">
  Font.js
</h1>

<div align="center">

![NPM License](https://img.shields.io/npm/l/fontjs)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/PeculiarVentures/Font.js/publish.yml?branch=master&label=publish)
[![npm version](https://img.shields.io/npm/v/fontjs.svg)](https://www.npmjs.com/package/fontjs)
![Coveralls](https://img.shields.io/coverallsCoverage/github/PeculiarVentures/Font.js)
[![npm downloads](https://img.shields.io/npm/dm/fontjs.svg)](https://www.npmjs.com/package/fontjs)

</div>

`fontjs` parses, edits, subsets and writes TrueType fonts in Node.js and browsers.

## Install

```bash
npm install fontjs bytestreamjs
```

`bytestreamjs` is a peer dependency: fontjs reads from and writes to its `SeqStream`. npm 7+ installs it automatically.

## Breaking Changes In v4

v4 is ESM-only and requires Node.js `^20.19.0 || >=22.12.0` (v3 declared no engines and also shipped CommonJS). CommonJS code can still `require("fontjs")` on these versions; Node.js 22.0–22.11 can't.

- **TypeScript compiling to CommonJS:** use `"module": "node20"` or `"nodenext"` (`node16` fails with TS1479). ESM and bundler setups need no changes.
- **Jest in CommonJS mode:** switch to ESM mode or Vitest, or transform `fontjs`, `bytestreamjs` and `@peculiar/utils` (exclude them from `transformIgnorePatterns`).
- **Deep imports** (`fontjs/build/cjs/...`, `fontjs/build/mjs/...`, `fontjs/build/types/...`) are blocked by `exports`; import from `fontjs`.
- **bytestreamjs 3 is a peer dependency** (v3 depended on bytestreamjs 2). Pass bytestreamjs 3 `SeqStream`/`ByteStream` objects; the API is the same as in bytestreamjs 2.

API changes:

- **DSIG:** `signatureBlock.signatureParsed` is removed, and fontjs no longer depends on `pkijs` or `asn1js`. `signatureBlock.signature` still holds the DER CMS `SignedData`; see [DSIG signatures](#dsig-signatures).
- **Types:** `HEAD.flags`/`macStyle` and `OS2.usWeightClass`/`usWidthClass`/`fsType`/`sFamilyClass`/`fsSelection` are typed `number` (they hold bit combinations and values that aren't enum members); the enums stay exported. `Format12Parameters.codeToGID` is `Map<number, number>`, and `Format12#gid()` returns the glyph ID instead of an array.

## Usage

```ts
import { readFile } from "node:fs/promises";
import { ByteStream, SeqStream } from "bytestreamjs";
import { Font, Tables } from "fontjs";

const buffer = await readFile("Example-Regular.ttf");
const font = Font.fromStream(new SeqStream({ stream: new ByteStream({ buffer: new Uint8Array(buffer).buffer }) }));

// Tables are keyed by their tag
const name = font.tables.get(Tables.NAME.tag) as Tables.NAME;
const head = font.tables.get(Tables.HEAD.tag) as Tables.HEAD;
console.log(name.getName(Tables.NameIDs.fullFontName), head.unitsPerEm);

// Unicode cmap lookup
const glyph = font.findUnicodeGlyph("A");
console.log(glyph?.index, glyph?.hAdvanceWidth);

// Subset to the glyphs of a string (the missing and null glyphs are added)
const subset = font.subset({
  glyphIndexes: [...new Set([..."Hello"].map((char) => font.findUnicodeGlyph(char)?.index ?? 0))],
  fontValues: { unitsPerEm: head.unitsPerEm },
  cmaps: [{ format: 4, language: 0, platformID: 3, platformSpecificID: 1 }],
  cmapLanguage: 0,
});

// Write a font
const output = new SeqStream();
subset.toStream(output);
const bytes = new Uint8Array(output.buffer);
```

## DSIG Signatures

fontjs reads the `DSIG` table but doesn't parse or verify signatures. A format 1 signature is a DER CMS `SignedData`, which a CMS library can parse, for example [pkijs](https://github.com/PeculiarVentures/PKI.js) 4:

```ts
import * as pkijs from "pkijs";

const dsig = font.tables.get(Tables.DSIG.tag) as Tables.DSIG | undefined;
for (const { signatureBlock } of dsig?.signatureRecords ?? []) {
  const contentInfo = pkijs.ContentInfo.fromBER(signatureBlock.signature);
  const signedData = new pkijs.SignedData({ schema: contentInfo.content });
  // signedData.certificates, signedData.signerInfos, ...
}
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development setup, checks and release process.

## Related

- [TrueType Reference Manual](https://developer.apple.com/fonts/TrueType-Reference-Manual/)
- [OpenType Specification](https://learn.microsoft.com/en-us/typography/opentype/spec/)
