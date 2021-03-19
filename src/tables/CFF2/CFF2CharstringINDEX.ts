import { SeqStream } from "bytestreamjs";
import { INDEXParameters, INDEX } from "../CFF";

export interface CharstringData {
	operator: string;
	operands: number[];
}

export interface CFF2CharstringINDEXParameters extends INDEXParameters<CharstringData> { }

export class CFF2CharstringINDEX extends INDEX<CharstringData> {

	constructor(parameters: CFF2CharstringINDEXParameters = {}) {
		super(parameters);
	}

	public static fromStream(stream: SeqStream): CFF2CharstringINDEX {
		//#region Decode main INDEX values
		const index = INDEX.fromStream(stream, 2);
		//#endregion

		const data = CFF2CharstringINDEX.decode(index.data);

		return new CFF2CharstringINDEX({ data });
	}

	protected static decode(data2: ArrayBuffer[]): CharstringData[] {
		const res: CharstringData[] = [];
		let stack: number[] = [];

		for (const data of data2) {
			const view = new DataView(data);

			for (let i = 0; i < view.byteLength; i++) {
				let code = view.getUint8(i);

				switch (true) {
					case (code === 1): // hstem
						{
							res.push({
								operator: "hstem",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 3): // vstem
						{
							res.push({
								operator: "vstem",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 4): // vmoveto
						{
							res.push({
								operator: "vmoveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 5): // rlineto
						{
							res.push({
								operator: "rlineto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 6): // hlineto
						{
							res.push({
								operator: "hlineto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 7): // vlineto
						{
							res.push({
								operator: "vlineto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 8): // rrcurveto
						{
							res.push({
								operator: "rrcurveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 10): // callsubr
						{
							res.push({
								operator: "callsubr",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 12): // escape
						{
							i++;
							code = view.getUint8(i);

							switch (true) {
								case ((code >= 0) && (code <= 33)): // reserved
									break;
								case (code === 34): // hflex
									{
										res.push({
											operator: "hflex",
											operands: stack
										});

										stack = [];
									}

									break;
								case (code === 35): // flex
									{
										res.push({
											operator: "flex",
											operands: stack
										});

										stack = [];
									}

									break;
								case (code === 36): // hflex1
									{
										res.push({
											operator: "hflex1",
											operands: stack
										});

										stack = [];
									}

									break;
								case (code === 37): // flex1
									{
										res.push({
											operator: "flex1",
											operands: stack
										});

										stack = [];
									}

									break;
								case ((code >= 38) && (code <= 255)): // reserved
									break;
								default:
							}
						}

						break;
					case (code === 15): // vsindex
						{
							res.push({
								operator: "vsindex",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 16): // blend
						{
							res.push({
								operator: "blend",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 18): // hstemhm
						{
							res.push({
								operator: "hstemhm",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 19): // hintmask
						{
							res.push({
								operator: "hintmask",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 20): // cntrmask
						{
							res.push({
								operator: "cntrmask",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 21): // rmoveto
						{
							res.push({
								operator: "rmoveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 22): // hmoveto
						{
							res.push({
								operator: "hmoveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 23): // vstemhm
						{
							res.push({
								operator: "vstemhm",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 24): // rcurveline
						{
							res.push({
								operator: "rcurveline",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 25): // rlinecurve
						{
							res.push({
								operator: "rlinecurve",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 26): // vvcurveto
						{
							res.push({
								operator: "vvcurveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 27): // hhcurveto
						{
							res.push({
								operator: "hhcurveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 28): // <numbers>
						{
							i++;
							const code2 = view.getUint8(i);

							stack.push(((code << 24) | (code2 << 16)) >> 16);
						}

						break;
					case (code === 29): // callgsubr
						{
							res.push({
								operator: "callgsubr",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 30): // vhcurveto
						{
							res.push({
								operator: "vhcurveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case (code === 31): // hvcurveto
						{
							res.push({
								operator: "hvcurveto",
								operands: stack
							});

							stack = [];
						}

						break;
					case ((code >= 32) && (code <= 246)):
						stack.push(code - 139);
						break;
					case ((code >= 247) && (code <= 250)):
						{
							i++;
							const code2 = view.getUint8(i);

							stack.push((code - 247) * 256 + code2 + 108);
						}

						break;
					case ((code >= 251) && (code <= 254)):
						{
							i++;
							const code2 = view.getUint8(i);

							stack.push(-((code - 251) * 256) - code2 - 108);
						}

						break;
					case (code === 255):
						{
							i++;

							code = view.getInt32(i, false);
							stack.push(code / 65536);

							i += 4;
						}

						break;
					default:
				}
			}
		}

		return res;
	}

}
