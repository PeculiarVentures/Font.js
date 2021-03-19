export interface TwoDParameters {
	array?: number[][];
}
export class TwoD {

	public array: number[][];

	constructor(parameters: TwoDParameters = {}) {
		this.array = parameters.array || [];
	}

	public get rows() {
		return this.array.length;
	}

	public get columns() {
		if (this.array.length)
			return this.array[0].length;

		return 0;
	}

	public row(index: number): number[] {
		if (index <= this.array.length) {
			return this.array[index];
		}

		return [];
	}

	public column(index: number): number[] {
		const result = [];

		if (this.array.length) {
			for (const element of this.array) {
				if (index <= element.length) {
					result.push(element[index]);
				}
			}
		}

		return result;
	}

	public deleteRow(index: number): void {
		this.array.splice(index, 1);
	}

	public deleteColumn(index: number): void {
		for (const element of this.array) {
			element.splice(index, 1);
		}
	}

}
