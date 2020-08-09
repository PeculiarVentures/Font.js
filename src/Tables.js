import { CMAP, Format4, Format6, Format0, CMAPSubTable, Format12, Format14 } from "./tables/CMAP.js";
import { HEAD } from "./tables/HEAD.js";
import { HHEA } from "./tables/HHEA.js";
import { HMTX } from "./tables/HMTX.js";
import { MAXP } from "./tables/MAXP.js";
import { GLYF, missingGlyph, SimpleGlyph, CompoundGlyph, CompoundGlyphFlags, EmptyGlyph, Glyph, SimpleGlyphFlags } from "./tables/GLYF.js";
import { LOCA } from "./tables/LOCA.js";
import { NAME } from "./tables/NAME.js";
import { POST } from "./tables/POST.js";
import { OS2 } from "./tables/OS2.js";
import { CVT } from "./tables/CVT.js";
import { FPGM } from "./tables/FPGM.js";
import { HDMX } from "./tables/HDMX.js";
import { PREP } from "./tables/PREP.js";
import { DSIG } from "./tables/DSIG.js";
import { GASP, RangeGaspBehaviorFlags } from "./tables/GASP.js";
import { KERN, Format0 as KernFormat0, Format2 as KernFormat2 } from "./tables/KERN.js";
import { CFF } from "./tables/CFF.js";
import { CFF2 } from "./tables/CFF2.js";
import { GDEF } from "./tables/GDEF.js";
//**************************************************************************************
export {
	CMAP, Format4, Format6, Format0, CMAPSubTable, Format12, Format14,
	HEAD,
	HHEA,
	HMTX,
	MAXP,
	GLYF, missingGlyph, SimpleGlyph, CompoundGlyph, CompoundGlyphFlags, EmptyGlyph, Glyph, SimpleGlyphFlags,
	LOCA,
	NAME,
	POST,
	OS2,
	CVT,
	FPGM,
	HDMX,
	PREP,
	DSIG,
	GASP, RangeGaspBehaviorFlags,
	KERN, KernFormat0, KernFormat2,
	CFF,
	CFF2,
	GDEF
};