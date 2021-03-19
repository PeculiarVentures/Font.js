import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../../BaseClass";
import { getF2Dot14 } from "../../common";

export interface VariationRegion {
	startCoord: number;
	peakCoord: number;
	endCoord: number;
}

export interface VariationRegionList {
	axisCount?: number;
	regionCount?: number;
	variationRegions?: VariationRegion[][];
}

export interface ItemVariationDataSubtables {
	itemCount: number;
	shortDeltaCount: number;
	regionIndexCount: number;
	regionIndexes: number[];
	deltaSets: number[][];
	axisCount?: number;
	regionCount?: number;
	variationRegions?: number[];
}

export interface ItemVariationStoreParameters {
	format?: number;
	itemVariationDataSubtables?: ItemVariationDataSubtables[];
	variationRegionList?: VariationRegionList;
}

export class ItemVariationStore extends BaseClass {

	public format: number;
	public itemVariationDataSubtables: ItemVariationDataSubtables[];
	public variationRegionList: VariationRegionList;

	constructor(parameters: ItemVariationStoreParameters = {}) {
		super();

		this.format = parameters.format || 1;
		this.itemVariationDataSubtables = parameters.itemVariationDataSubtables || [];
		this.variationRegionList = parameters.variationRegionList || {};
	}

	static fromStream(stream: SeqStream) {
		const parameters: ItemVariationStoreParameters = {};

		parameters.format = stream.getUint16();

		switch (parameters.format) {
			case 1:
				{
					const variationRegionListOffset = stream.getUint32();
					const itemVariationDataOffsets = [];

					const itemVariationDataCount = stream.getUint16();

					for (let i = 0; i < itemVariationDataCount; i++) {
						const offset = stream.getUint32();
						itemVariationDataOffsets.push(offset);
					}

					parameters.itemVariationDataSubtables = [];

					for (const offset of itemVariationDataOffsets) {
						stream.start = offset;

						const subtable: ItemVariationDataSubtables = {
							itemCount: stream.getUint16(),
							shortDeltaCount: stream.getUint16(),
							regionIndexCount: stream.getUint16(),
							regionIndexes: [],
							deltaSets: [],
						};


						for (let i = 0; i < subtable.regionIndexCount; i++) {
							const index = stream.getUint16();
							subtable.regionIndexes.push(index);
						}


						for (let i = 0; i < subtable.itemCount; i++) {
							const set = [];

							for (let j = 0; j < subtable.shortDeltaCount; j++) {
								const value = stream.getInt16();
								set.push(value);
							}

							for (let j = 0; j < (subtable.regionIndexCount - subtable.shortDeltaCount); j++) {
								const value = (stream.getBlock(1))[0];
								const int8 = (Int8Array.from([value]))[0];

								set.push(int8);
							}

							subtable.deltaSets.push(set);
						}

						parameters.itemVariationDataSubtables.push(subtable);
					}

					//#region Parse "VariationRegionList"
					stream.start = variationRegionListOffset;

					parameters.variationRegionList = {};

					parameters.variationRegionList.axisCount = stream.getUint16();
					parameters.variationRegionList.regionCount = stream.getUint16();
					parameters.variationRegionList.variationRegions = [];

					for (let i = 0; i < parameters.variationRegionList.regionCount; i++) {
						const regionAxes: VariationRegion[] = [];

						for (let j = 0; j < parameters.variationRegionList.axisCount; j++) {
							const record: VariationRegion = {
								startCoord: getF2Dot14(stream),
								peakCoord: getF2Dot14(stream),
								endCoord: getF2Dot14(stream),
							};

							regionAxes.push(record);
						}

						parameters.variationRegionList.variationRegions.push(regionAxes);
					}
					//#endregion
				}

				break;
			default:
		}

		return new ItemVariationStore(parameters);
	}

}