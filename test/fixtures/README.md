# Test fixtures

| File                     | What it is                                                                                                                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FontJSTest-Regular.ttf` | TrueType font with `OS/2`, `cmap` (format 4 for 0/3 and 3/1, format 12 for 3/10), `glyf` (simple, empty and compound glyphs), `head`, `hhea`, `hmtx`, `loca`, `maxp`, `name` (Mac and Windows records), `post` (format 2) |
| `FontJSTest-DSIG.ttf`    | The same font with a `DSIG` table that holds `signature.der`                                                                                                                                                              |
| `signature.der`          | CMS `SignedData` (DER) over the bytes `Font.js DSIG fixture`, signed with a throwaway self-signed P-256 certificate                                                                                                       |

The outlines are simple shapes drawn in `generate.py`, so the fonts contain no third-party font data.

Regenerate the fonts with [fontTools](https://github.com/fonttools/fonttools) (output is deterministic):

```bash
python3 -m venv .venv && .venv/bin/pip install fonttools==4.60.1
.venv/bin/python test/fixtures/generate.py
```

`signature.der` was made once with OpenSSL; the key was not kept:

```bash
openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout key.pem -out cert.pem -days 3650 -subj "/CN=Font.js test signer"
printf 'Font.js DSIG fixture' > content.bin
openssl cms -sign -binary -in content.bin -signer cert.pem -inkey key.pem -md sha256 -outform DER -out signature.der
```
