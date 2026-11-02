"""Generates the TrueType fixtures used by the specs.

Requires fontTools (tested with 4.60.1):

    python3 -m venv .venv && .venv/bin/pip install fonttools==4.60.1
    .venv/bin/python test/fixtures/generate.py

The outlines are simple shapes drawn here, so the fixtures carry no
third-party font data and fall under this repository's license.
"""

from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont, newTable
from fontTools.ttLib.tables.D_S_I_G_ import SignatureRecord
from fontTools.ttLib.tables._g_l_y_f import GlyphComponent

HERE = Path(__file__).parent
# 2024-01-01T00:00:00Z in seconds since 1904-01-01 (LONGDATETIME)
TIMESTAMP = 3786912000


def rect(pen, x0, y0, x1, y1):
    pen.moveTo((x0, y0))
    pen.lineTo((x0, y1))
    pen.lineTo((x1, y1))
    pen.lineTo((x1, y0))
    pen.closePath()


def draw(fn):
    pen = TTGlyphPen(None)
    fn(pen)
    return pen.glyph()


def notdef(pen):
    rect(pen, 50, 0, 450, 700)
    rect(pen, 100, 50, 400, 650)  # counter (same winding is fine for a fixture)


def letter_a(pen):
    pen.moveTo((0, 0))
    pen.lineTo((300, 700))
    pen.lineTo((600, 0))
    pen.lineTo((480, 0))
    pen.lineTo((300, 450))
    pen.lineTo((120, 0))
    pen.closePath()


def letter_b(pen):
    rect(pen, 80, 0, 180, 700)
    pen.moveTo((180, 0))
    pen.qCurveTo((520, 0), (520, 350), (180, 350))
    pen.closePath()
    pen.moveTo((180, 350))
    pen.qCurveTo((480, 350), (480, 700), (180, 700))
    pen.closePath()


def grave(pen):
    pen.moveTo((0, 900))
    pen.lineTo((100, 950))
    pen.lineTo((200, 780))
    pen.lineTo((150, 760))
    pen.closePath()


def build():
    glyph_order = [".notdef", "space", "A", "B", "grave", "Agrave"]
    fb = FontBuilder(1000, isTTF=True)
    fb.setupGlyphOrder(glyph_order)
    fb.setupCharacterMap(
        {
            0x20: "space",
            0x41: "A",
            0x42: "B",
            0x60: "grave",
            0xC0: "Agrave",
            0x1F170: "A",  # NEGATIVE SQUARED LATIN CAPITAL LETTER A, forces a format 12 subtable
        }
    )
    glyphs = {
        ".notdef": draw(notdef),
        "space": draw(lambda pen: None),
        "A": draw(letter_a),
        "B": draw(letter_b),
        "grave": draw(grave),
    }
    fb.setupGlyf(glyphs)

    # Agrave = A + grave shifted right: a compound glyph
    glyf = fb.font["glyf"]
    agrave = draw(lambda pen: None)
    base = GlyphComponent()
    base.glyphName, base.x, base.y, base.flags = "A", 0, 0, 0
    accent = GlyphComponent()
    accent.glyphName, accent.x, accent.y, accent.flags = "grave", 200, 0, 0
    agrave.numberOfContours = -1
    agrave.components = [base, accent]
    glyf["Agrave"] = agrave
    glyf["Agrave"].recalcBounds(glyf)

    advance = {".notdef": 500, "space": 250, "A": 600, "B": 560, "grave": 300, "Agrave": 600}
    fb.setupHorizontalMetrics({name: (advance[name], glyf[name].xMin if hasattr(glyf[name], "xMin") else 0) for name in glyph_order})
    fb.setupHorizontalHeader(ascent=800, descent=-200)
    fb.setupNameTable(
        {
            "copyright": "Public domain test font for Font.js",
            "familyName": "FontJS Test",
            "styleName": "Regular",
            "uniqueFontIdentifier": "FontJSTest-Regular;1.000",
            "fullName": "FontJS Test Regular",
            "version": "Version 1.000",
            "psName": "FontJSTest-Regular",
        }
    )
    fb.setupOS2(sTypoAscender=800, sTypoDescender=-200, usWinAscent=950, usWinDescent=200, achVendID="PVFJ")
    fb.setupPost(italicAngle=0, underlinePosition=-100, underlineThickness=50)
    fb.setupHead(unitsPerEm=1000, created=TIMESTAMP, modified=TIMESTAMP, fontRevision=1.0)
    fb.font.recalcTimestamp = False
    return fb.font


def main():
    font = build()
    font.save(HERE / "FontJSTest-Regular.ttf")

    # Same font with a DSIG table holding the CMS SignedData from signature.der
    # (see README.md for the openssl commands that produced it).
    font = TTFont(HERE / "FontJSTest-Regular.ttf", recalcTimestamp=False)
    dsig = newTable("DSIG")
    dsig.ulVersion = 1
    dsig.usFlag = 1
    record = SignatureRecord()
    record.ulFormat = 1
    record.usReserved1 = 0
    record.usReserved2 = 0
    record.pkcs7 = (HERE / "signature.der").read_bytes()
    dsig.usNumSigs = 1
    dsig.signatureRecords = [record]
    font["DSIG"] = dsig
    font.save(HERE / "FontJSTest-DSIG.ttf")


if __name__ == "__main__":
    main()
