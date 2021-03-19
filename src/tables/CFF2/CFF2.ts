import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../../BaseClass";
import { INDEX, DICT } from "../CFF";
import { CFF2CharstringINDEX } from "./CFF2CharstringINDEX";
import { CFF2FDSelect } from "./CFF2FDSelect";
import { CFF2PrivateDICT } from "./CFF2PrivateDICT";
import { CFF2TopDICT } from "./CFF2TopDICT";
import { VariationStoreData } from "./VariationStoreData";

export interface CFF2Parameters {
	FDSelect?: CFF2FDSelect;
	topDICT?: CFF2TopDICT;
	globalSubrINDEX?: INDEX;
	CharStringsINDEX?: CFF2CharstringINDEX;
	FDArrayINDEX?: INDEX;
	PrivateDICTs?: CFF2PrivateDICT[];
	VariationStoreData?: VariationStoreData;
}

export class CFF2 extends BaseClass {

	public FDSelect?: CFF2FDSelect;
	public topDICT?: CFF2TopDICT;
	public globalSubrINDEX?: INDEX;
	public CharStringsINDEX?: CFF2CharstringINDEX;
	public FDArrayINDEX?: INDEX;
	public PrivateDICTs?: CFF2PrivateDICT[];
	public VariationStoreData?: VariationStoreData;

	public constructor(params: CFF2Parameters = {}) {
		super();

		if (params.FDSelect) {
			this.FDSelect = params.FDSelect;
		}
		if (params.topDICT) {
			this.topDICT = params.topDICT;
		}
		if (params.globalSubrINDEX) {
			this.globalSubrINDEX = params.globalSubrINDEX;
		}
		if (params.CharStringsINDEX) {
			this.CharStringsINDEX = params.CharStringsINDEX;
		}
		if (params.FDArrayINDEX) {
			this.FDArrayINDEX = params.FDArrayINDEX;
		}
		this.PrivateDICTs = params.PrivateDICTs || [];
		if (params.VariationStoreData) {
			this.VariationStoreData = params.VariationStoreData;
		}
	}

	static get tag() {
		return 0x43464632;
	}

	static fromStream(stream: SeqStream): CFF2 {
		//#region Initial variables
		const parameters: CFF2Parameters = {};
		//#endregion

		//#region Read header information
		const headerBlock = stream.getBlock(3);

		const header = {
			majorVersion: headerBlock[0],
			minorVersion: headerBlock[1],
			headerSize: headerBlock[2],
			topDictLength: stream.getUint16(),
		};
		//#endregion

		//#region Read possible "extension bytes"
		stream.getBlock(header.headerSize - 5);
		//#endregion

		//#region Parse "Top DICT"
		parameters.topDICT = CFF2TopDICT.fromBuffer(stream.stream.buffer.slice(stream.start, stream.start + header.topDictLength));
		//#endregion

		//#region Parse "Global Subr" index
		stream.start = stream.start + header.topDictLength;

		parameters.globalSubrINDEX = INDEX.fromStream(stream, header.majorVersion);
		//#endregion

		if (parameters.topDICT.CharStrings) {
			parameters.CharStringsINDEX = CFF2CharstringINDEX.fromStream(new SeqStream({ stream: stream.stream.slice(parameters.topDICT.CharStrings) }));
		}

		if (parameters.topDICT.FDArray) {
			parameters.FDArrayINDEX = INDEX.fromStream(new SeqStream({ stream: stream.stream.slice(parameters.topDICT.FDArray) }), header.majorVersion);
			parameters.PrivateDICTs = [];

			for (const data of parameters.FDArrayINDEX.data) {
				const dict = DICT.fromBuffer(data);

				for (const entry of dict.entries) {
					switch (entry.key) {
						case 18:
							{
								const dict = CFF2PrivateDICT.fromBuffer(stream.stream.buffer.slice(entry.values[1], entry.values[1] + entry.values[0]));
								if (dict.Subrs) {
									dict.SubrsINDEX = CFF2CharstringINDEX.fromStream(new SeqStream({ stream: stream.stream.slice(entry.values[1] + dict.Subrs) }));
								}

								parameters.PrivateDICTs.push(dict);
							}

							break;
						default:
					}
				}
			}
		}

		if (parameters.topDICT.FDSelect) {
			if (parameters.CharStringsINDEX) {
				parameters.FDSelect = CFF2FDSelect.fromStream(
					new SeqStream({ stream: stream.stream.slice(parameters.topDICT.FDSelect) }),
					parameters.CharStringsINDEX.data.length
				);
			}
		}

		if (parameters.topDICT.vstore) {
			parameters.VariationStoreData = VariationStoreData.fromStream(new SeqStream({ stream: stream.stream.slice(parameters.topDICT.vstore) }));
		}

		return new CFF2(parameters);
	}

}
