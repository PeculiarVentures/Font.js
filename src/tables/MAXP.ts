import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass";
import { FontTable } from "../Table";
import { Glyph, SimpleGlyph, CompoundGlyph } from "./GLYF";

export interface MAXPParameters {
	version?: number;
	numGlyphs?: number;
	maxPoints?: number;
	maxContours?: number;
	maxComponentPoints?: number;
	maxComponentContours?: number;
	maxZones?: number;
	maxTwilightPoints?: number;
	maxStorage?: number;
	maxFunctionDefs?: number;
	maxInstructionDefs?: number;
	maxStackElements?: number;
	maxSizeOfInstructions?: number;
	maxComponentElements?: number;
	maxComponentDepth?: number;
	glyphs?: Glyph[];
}

export class MAXP extends FontTable {
	public version: number;
	public numGlyphs: number;
	public maxPoints?: number;
	public maxContours?: number;
	public maxComponentPoints?: number;
	public maxComponentContours?: number;
	public maxZones?: number;
	public maxTwilightPoints?: number;
	public maxStorage?: number;
	public maxFunctionDefs?: number;
	public maxInstructionDefs?: number;
	public maxStackElements?: number;
	public maxSizeOfInstructions?: number;
	public maxComponentElements?: number;
	public maxComponentDepth?: number;

	constructor(parameters: MAXPParameters = {}) {
		super();

		//this.version = parameters.version || 0x00010000;
		this.version = parameters.version || 0x00005000;
		this.numGlyphs = parameters.numGlyphs || 0;

		if (this.version === 0x00010000) {
			this.maxPoints = parameters.maxPoints || 0;
			this.maxContours = parameters.maxContours || 0;
			this.maxComponentPoints = parameters.maxComponentPoints || 0;
			this.maxComponentContours = parameters.maxComponentContours || 0;
			this.maxZones = parameters.maxZones || 2;
			this.maxTwilightPoints = parameters.maxTwilightPoints || 100;
			this.maxStorage = parameters.maxStorage || 256;
			this.maxFunctionDefs = parameters.maxFunctionDefs || 256;
			this.maxInstructionDefs = parameters.maxInstructionDefs || 256;
			this.maxStackElements = parameters.maxStackElements || 3000;
			this.maxSizeOfInstructions = parameters.maxSizeOfInstructions || 0;
			this.maxComponentElements = parameters.maxComponentElements || 0;
			this.maxComponentDepth = parameters.maxComponentDepth || 1;
		}

		if (parameters.glyphs) {
			this.fromGlyphs(parameters.glyphs);
		}
	}

	public static get tag() {
		return 0x6D617870;
	}

	/**
	 * Construct MAXP table from array of glyphs
	 */
	public fromGlyphs(glyphs: Glyph[]): void {
		//#region Perform simple initialization
		this.numGlyphs = glyphs.length;

		if (this.version === 0x00005000) {
			return;
		}
		//#endregion

		const referencedGlyphs = new Map();

		//#region Aux function calculating values for composite glyphs
		const calculateCompositeGlyph = (glyph: Glyph, depth: number) => { // TODO extract aux function
			const result = {
				componentContours: 0,
				componentPoints: 0,
				// TODO Remove comments
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				sizeOfInstructions: glyph.instructions.length,
				componentDepth: depth
			};

			// TODO Remove comments
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			for (const component of glyph.components) {
				referencedGlyphs.set(component.glyphIndex, 1);

				const componentGlyph = glyphs[component.glyphIndex];

				switch (true) {
					case ((componentGlyph.constructor as typeof BaseClass).className === SimpleGlyph.className):
						{
							const simpleGlyph = componentGlyph as SimpleGlyph;
							result.componentContours += simpleGlyph.numberOfContours;
							// TODO Remove comment
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							result.componentPoints += simpleGlyph.xCoordinates!.length;
							// TODO Remove comment
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							result.sizeOfInstructions += simpleGlyph.instructions!.length;
							result.componentDepth = Math.max(depth + 1, result.componentDepth);
						}
						break;
					case ((componentGlyph.constructor as typeof BaseClass).className === CompoundGlyph.className):
						{
							const compoundGlyph = componentGlyph as CompoundGlyph; // TODO ComponentGlyph cant be converted to SimpleGlyph
							const componentResult = calculateCompositeGlyph(compoundGlyph, result.componentDepth + 1);

							result.componentContours += componentResult.componentContours;
							result.componentPoints += componentResult.componentPoints;
							result.sizeOfInstructions += componentResult.sizeOfInstructions;
							result.componentDepth = componentResult.componentDepth;
						}

						break;
					default:
				}
			}

			return result;
		};
		//#endregion

		//#region Major loop
		for (const glyph of glyphs) {
			const className = (glyph.constructor as typeof BaseClass).className;
			switch (true) {
				case (className === SimpleGlyph.className):
					{
						const simpleGlyph = glyph as SimpleGlyph;
						// TODO Remove comment
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						this.maxPoints = Math.max(this.maxPoints!, simpleGlyph.xCoordinates!.length);
						// TODO Remove comment
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						this.maxContours = Math.max(this.maxContours!, simpleGlyph.numberOfContours);
						// TODO Remove comment
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						this.maxSizeOfInstructions = Math.max(this.maxSizeOfInstructions!, simpleGlyph.instructions!.length);
					}
					break;
				case (className === CompoundGlyph.className):
					{
						const compositeResult = calculateCompositeGlyph(glyph, 1);

						// TODO Remove comment
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						this.maxComponentContours = Math.max(this.maxComponentContours!, compositeResult.componentContours);
						// TODO Remove comment
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						this.maxComponentPoints = Math.max(this.maxComponentPoints!, compositeResult.componentPoints);
						// TODO Remove comment
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						this.maxComponentDepth = Math.max(this.maxComponentDepth!, compositeResult.componentDepth);
						// TODO Remove comment
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						this.maxSizeOfInstructions = Math.max(this.maxSizeOfInstructions!, compositeResult.sizeOfInstructions);
					}
					break;
				default:
			}
		}
		//#endregion

		this.maxComponentElements = referencedGlyphs.size;
	}

	public toStream(stream: SeqStream): boolean {

		stream.appendUint32(this.version);
		stream.appendUint16(this.numGlyphs);

		switch (this.version) {
			case 0x00010000:
				/**
				 * TODO optimize type. Maybe split current class to different version implementations.
				 * Looks like those properties are required for version 0x00010000 and should not use OR operator
				 */
				//
				stream.appendUint16(this.maxPoints || 0);
				stream.appendUint16(this.maxContours || 0);
				stream.appendUint16(this.maxComponentPoints || 0);
				stream.appendUint16(this.maxComponentContours || 0);
				stream.appendUint16(this.maxZones || 0);
				stream.appendUint16(this.maxTwilightPoints || 0);
				stream.appendUint16(this.maxStorage || 0);
				stream.appendUint16(this.maxFunctionDefs || 0);
				stream.appendUint16(this.maxInstructionDefs || 0);
				stream.appendUint16(this.maxStackElements || 0);
				stream.appendUint16(this.maxSizeOfInstructions || 0);
				stream.appendUint16(this.maxComponentElements || 0);
				stream.appendUint16(this.maxComponentDepth || 0);

				break;
			case 0x00005000:
				break;
			default:
				throw new Error(`Incorrect version for MAXP - ${this.version}`);
		}

		return true;
	}

	public static fromStream(stream: SeqStream): MAXP {
		const version = stream.getUint32();
		const numGlyphs = stream.getUint16();

		switch (version) {
			case 0x00010000:
				{
					const maxPoints = stream.getUint16();
					const maxContours = stream.getUint16();
					const maxComponentPoints = stream.getUint16();
					const maxComponentContours = stream.getUint16();
					const maxZones = stream.getUint16();
					const maxTwilightPoints = stream.getUint16();
					const maxStorage = stream.getUint16();
					const maxFunctionDefs = stream.getUint16();
					const maxInstructionDefs = stream.getUint16();
					const maxStackElements = stream.getUint16();
					const maxSizeOfInstructions = stream.getUint16();
					const maxComponentElements = stream.getUint16();
					const maxComponentDepth = stream.getUint16();

					return new MAXP({
						version,
						numGlyphs,
						maxPoints,
						maxContours,
						maxComponentPoints,
						maxComponentContours,
						maxZones,
						maxTwilightPoints,
						maxStorage,
						maxFunctionDefs,
						maxInstructionDefs,
						maxStackElements,
						maxSizeOfInstructions,
						maxComponentElements,
						maxComponentDepth
					});
				}
			case 0x00005000:
				return new MAXP({
					version,
					numGlyphs
				});
			default:
				throw new Error(`Incorrect version for MAXP - ${version}`);
		}
	}

}
