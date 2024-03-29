
const mapping = new Map([
	[0x40, "NPUSHB"], // VL
	[0x41, "NPUSHW"], // VL
	[0xB0, "PUSHB"], // FL
	[0xB1, "PUSHB"],
	[0xB2, "PUSHB"],
	[0xB3, "PUSHB"],
	[0xB4, "PUSHB"],
	[0xB5, "PUSHB"],
	[0xB6, "PUSHB"],
	[0xB7, "PUSHB"],
	[0xB8, "PUSHW"], // FL
	[0xB9, "PUSHW"],
	[0xBA, "PUSHW"],
	[0xBB, "PUSHW"],
	[0xBC, "PUSHW"],
	[0xBD, "PUSHW"],
	[0xBE, "PUSHW"],
	[0xBF, "PUSHW"],
	[0x43, "RS"], // ZL
	[0x42, "WS"], // ZL
	[0x44, "WCVTP"], // ZL
	[0x70, "WCVTF"], // ZL
	[0x45, "RCVT"], // ZL
	[0x00, "SVTCA"],
	[0x01, "SVTCA"],
	[0x02, "SPVTCA"],
	[0x03, "SPVTCA"],
	[0x04, "SFVTCA"],
	[0x05, "SFVTCA"],
	[0x06, "SPVTL"],
	[0x07, "SPVTL"],
	[0x08, "SFVTL"],
	[0x09, "SFVTL"],
	[0x0E, "SFVTPV"],
	[0x86, "SDPVTL"],
	[0x87, "SDPVTL"],
	[0x0A, "SPVFS"],
	[0x0B, "SFVFS"],
	[0x0C, "GPV"],
	[0x0D, "GFV"],
	[0x10, "SRP0"],
	[0x11, "SRP1"],
	[0x12, "SRP2"],
	[0x13, "SZP0"],
	[0x14, "SZP1"],
	[0x15, "SZP2"],
	[0x16, "SZPS"],
	[0x19, "RTHG"],
	[0x18, "RTG"],
	[0x3D, "RTDG"],
	[0x7D, "RDTG"],
	[0x7C, "RUTG"],
	[0x7A, "ROFF"],
	[0x76, "SROUND"],
	[0x77, "S45ROUND"],
	[0x17, "SLOOP"],
	[0x1A, "SMD"],
	[0x8E, "INSTCTRL"],
	[0x85, "SCANCTRL"],
	[0x8D, "SCANTYPE"],
	[0x1D, "SCVTCI"],
	[0x1E, "SSWCI"],
	[0x1F, "SSW"],
	[0x4D, "FLIPON"],
	[0x4E, "FLIPOFF"],
	[0x7E, "SANGW"],
	[0x5E, "SDB"],
	[0x5F, "SDS"],
	[0x46, "GC"],
	[0x47, "GC"],
	[0x48, "SCFS"],
	[0x49, "MD"],
	[0x4A, "MD"],
	[0x4B, "MPPEM"],
	[0x4C, "MPS"],
	[0x80, "FLIPPT"],
	[0x81, "FLIPRGON"],
	[0x82, "FLIPRGOFF"],
	[0x32, "SHP"],
	[0x33, "SHP"],
	[0x34, "SHC"],
	[0x35, "SHC"],
	[0x36, "SHZ"],
	[0x37, "SHZ"],
	[0x38, "SHPIX"],
	[0x3A, "MSIRP"],
	[0x3B, "MSIRP"],
	[0x2E, "MDAP"],
	[0x2F, "MDAP"],
	[0x3E, "MIAP"],
	[0x3F, "MIAP"],
	[0xC0, "MDRP"],
	[0xC1, "MDRP"],
	[0xC2, "MDRP"],
	[0xC3, "MDRP"],
	[0xC4, "MDRP"],
	[0xC5, "MDRP"],
	[0xC6, "MDRP"],
	[0xC7, "MDRP"],
	[0xC8, "MDRP"],
	[0xC9, "MDRP"],
	[0xCA, "MDRP"],
	[0xCB, "MDRP"],
	[0xCC, "MDRP"],
	[0xCD, "MDRP"],
	[0xCE, "MDRP"],
	[0xCF, "MDRP"],
	[0xD0, "MDRP"],
	[0xD1, "MDRP"],
	[0xD2, "MDRP"],
	[0xD3, "MDRP"],
	[0xD4, "MDRP"],
	[0xD5, "MDRP"],
	[0xD6, "MDRP"],
	[0xD7, "MDRP"],
	[0xD8, "MDRP"],
	[0xD9, "MDRP"],
	[0xDA, "MDRP"],
	[0xDB, "MDRP"],
	[0xDC, "MDRP"],
	[0xDD, "MDRP"],
	[0xDE, "MDRP"],
	[0xDF, "MDRP"],
	[0xE0, "MIRP"],
	[0xE1, "MIRP"],
	[0xE2, "MIRP"],
	[0xE3, "MIRP"],
	[0xE4, "MIRP"],
	[0xE5, "MIRP"],
	[0xE6, "MIRP"],
	[0xE7, "MIRP"],
	[0xE8, "MIRP"],
	[0xE9, "MIRP"],
	[0xEA, "MIRP"],
	[0xEB, "MIRP"],
	[0xEC, "MIRP"],
	[0xED, "MIRP"],
	[0xEE, "MIRP"],
	[0xEF, "MIRP"],
	[0xF0, "MIRP"],
	[0xF1, "MIRP"],
	[0xF2, "MIRP"],
	[0xF3, "MIRP"],
	[0xF4, "MIRP"],
	[0xF5, "MIRP"],
	[0xF6, "MIRP"],
	[0xF7, "MIRP"],
	[0xF8, "MIRP"],
	[0xF9, "MIRP"],
	[0xFA, "MIRP"],
	[0xFB, "MIRP"],
	[0xFC, "MIRP"],
	[0xFD, "MIRP"],
	[0xFE, "MIRP"],
	[0xFF, "MIRP"],
	[0x3C, "ALIGNRP"],
	[0x0F, "ISECT"],
	[0x27, "ALIGNPTS"],
	[0x39, "IP"],
	[0x29, "UTP"],
	[0x30, "IUP"],
	[0x31, "IUP"],
	[0x5D, "DELTAP1"],
	[0x71, "DELTAP2"],
	[0x72, "DELTAP3"],
	[0x73, "DELTAC1"],
	[0x74, "DELTAC2"],
	[0x75, "DELTAC3"],
	[0x20, "DUP"],
	[0x21, "POP"],
	[0x22, "CLEAR"],
	[0x23, "SWAP"],
	[0x24, "DEPTH"],
	[0x25, "CINDEX"],
	[0x26, "MINDEX"],
	[0x8A, "ROLL"],
	[0x58, "IF"],
	[0x1B, "ELSE"],
	[0x59, "EIF"],
	[0x78, "JROT"],
	[0x1C, "JMPR"],
	[0x79, "JROF"],
	[0x50, "LT"],
	[0x51, "LTEQ"],
	[0x52, "GT"],
	[0x53, "GTEQ"],
	[0x54, "EQ"],
	[0x55, "NEQ"],
	[0x56, "ODD"],
	[0x57, "EVEN"],
	[0x5A, "AND"],
	[0x5B, "OR"],
	[0x5C, "NOT"],
	[0x60, "ADD"],
	[0x61, "SUB"],
	[0x62, "DIV"],
	[0x63, "MUL"],
	[0x64, "ABS"],
	[0x65, "NEG"],
	[0x66, "FLOOR"],
	[0x67, "CEILING"],
	[0x8B, "MAX"],
	[0x8C, "MIN"],
	[0x68, "ROUND"],
	[0x69, "ROUND"],
	[0x6A, "ROUND"],
	[0x6B, "ROUND"],
	[0x6C, "NROUND"],
	[0x6D, "NROUND"],
	[0x6E, "NROUND"],
	[0x6F, "NROUND"],
	[0x2C, "FDEF"],
	[0x2D, "ENDF"],
	[0x2B, "CALL"],
	[0x2A, "LOOPCALL"],
	[0x89, "IDEF"],
	[0x4F, "DEBUG"],
	[0x88, "GETINFO"],
	[0x91, "GETVARIATION"],
]);
export class Instructions {

	fromArray(array: number[]) {
		const i = 0;

		while (i < array.length) {
			const found = mapping.get(array[i]);
			if (typeof found === "undefined")
				throw new Error(`Unknown instruction: ${array[i]}`);

			switch (found) {
				case "":
			}
		}
	}

	toArray() {
		// nothing
	}

}

