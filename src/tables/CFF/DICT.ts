import { INDEXParameters } from "./IDX";

export interface DICTEntry {
	key: number;
	values: number[];
}

export interface DICTParameters extends INDEXParameters {
	entries?: DICTEntry[];
}

const represents = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "E", "E-", "", "-"];

export class DICT {

	public entries: DICTEntry[];

	constructor(parameters: DICTParameters = {}) {
		this.entries = parameters.entries || [];
	}

	/**
	 * Convert ArrayBuffer data to object
	 *
	 * @param buffer
	 *
	 * @returns Result of the function
	 */
	public static fromBuffer(buffer: ArrayBuffer): DICT {
		//#region Initial variables
		const view = new DataView(buffer);

		const entries: DICTEntry[] = [];
		let values: number[] = [];
		let current = 0;
		//#endregion

		while (current < buffer.byteLength) {
			let value = null;

			const b0 = view.getUint8(current);
			current++;

			switch (true) {
				case (b0 <= 27):
					{
						let key = b0;

						if (key === 12) {
							key = 1200 + view.getUint8(current);
							current++;
						}

						entries.push({ key, values });
						values = [];
					}

					break;
				case (b0 === 28):
					{
						const b1 = view.getUint8(current);
						current++;
						const b2 = view.getUint8(current);
						current++;

						value = (b1 << 8 | b2);
					}

					break;
				case (b0 === 29):
					{
						const b1 = view.getUint8(current);
						current++;
						const b2 = view.getUint8(current);
						current++;
						const b3 = view.getUint8(current);
						current++;
						const b4 = view.getUint8(current);
						current++;

						value = (b1 << 24 | b2 << 16 | b3 << 8 | b4);
					}

					break;
				case (b0 === 30):
					{
						let real = "";

						while (true) {
							const nibbles = view.getUint8(current);
							current++;

							const n1 = nibbles >> 4;
							if (n1 === 0xF)
								break;

							real += represents[n1];

							const n2 = nibbles & 0xF;
							if (n2 === 0xF)
								break;

							real += represents[n2];
						}

						value = parseFloat(real);
					}

					break;
				case ((b0 >= 32) && (b0 <= 246)):
					value = (b0 - 139);
					break;
				case ((b0 >= 247) && (b0 <= 250)):
					{
						const b1 = view.getUint8(current);
						current++;

						value = ((b0 - 247) * 256 + b1 + 108);
					}

					break;
				case ((b0 >= 251) && (b0 <= 254)):
					{
						const b1 = view.getUint8(current);
						current++;

						value = (-(b0 - 251) * 256 - b1 - 108);
					}

					break;
				default:
			}

			if (value !== null)
				values.push(value);
		}

		return new DICT({ entries });
	}

}
