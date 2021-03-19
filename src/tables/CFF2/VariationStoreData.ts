import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../../BaseClass";
import { ItemVariationStore } from "./ItemVariationStore";

export interface VariationStoreDataParameters {
	itemVariationStore?: ItemVariationStore;
}

export class VariationStoreData extends BaseClass {

	public itemVariationStore: ItemVariationStore;

	constructor(parameters: VariationStoreDataParameters = {}) {
		super();

		this.itemVariationStore = parameters.itemVariationStore || new ItemVariationStore();
	}

	static fromStream(stream: SeqStream) {
		const parameters: VariationStoreDataParameters = {};

		const length = stream.getUint16();
		parameters.itemVariationStore = ItemVariationStore.fromStream(new SeqStream({ stream: stream.stream.slice(stream.start, stream.start + length) }));

		return new VariationStoreData(parameters);
	}

}
