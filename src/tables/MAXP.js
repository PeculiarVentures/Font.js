import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass.js";
import { Glyph, SimpleGlyph, CompoundGlyph } from "./GLYF.js";
//**************************************************************************************
export class MAXP extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		//this.version = parameters.version || 0x00010000;
		this.version = parameters.version || 0x00005000;
		this.numGlyphs = parameters.numGlyphs || 0;

		if(this.version === 0x00010000)
		{
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

		if("glyphs" in parameters)
			this.fromGlyphs(parameters.glyphs);
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x6D617870;
	}
	//**********************************************************************************
	/**
	 * Construct MAXP table from array of glyphs
	 *
	 * @param {Array<Glyph>} glyphs
	 */
	fromGlyphs(glyphs)
	{
		//region Perform simple initialization
		this.numGlyphs = glyphs.length;

		if(this.version === 0x00005000)
			return;
		//endregion

		const referencedGlyphs = new Map();

		//region Aux function calculatig values for composite glyphs
		const calculateCompositeGlyph = (glyph, depth) =>
		{
			const result = {
				componentContours: 0,
				componentPoints: 0,
				sizeOfInstructions: glyph.instructions.length,
				componentDepth: depth
			};

			for(const component of glyph.components)
			{
				referencedGlyphs.set(component.glyphIndex, 1);

				const componentGlyph = glyphs[component.glyphIndex];

				switch(true)
				{
					case (componentGlyph.constructor.className === SimpleGlyph.className):
						result.componentContours += componentGlyph.numberOfContours;
						result.componentPoints += componentGlyph.xCoordinates.length;
						result.sizeOfInstructions += componentGlyph.instructions.length;
						result.componentDepth = Math.max(depth + 1, result.componentDepth);

						break;
					case (componentGlyph.constructor.className === CompoundGlyph.className):
						{
							const componentResult = calculateCompositeGlyph(componentGlyph, result.componentDepth + 1);

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
		}
		//endregion

		//region Major loop
		for(const glyph of glyphs)
		{
			switch(true)
			{
				case (glyph.constructor.className === SimpleGlyph.className):
					{
						this.maxPoints = Math.max(this.maxPoints, glyph.xCoordinates.length);
						this.maxContours = Math.max(this.maxContours, glyph.numberOfContours);

						this.maxSizeOfInstructions = Math.max(this.maxSizeOfInstructions, glyph.instructions.length);
					}
					break;
				case (glyph.constructor.className === CompoundGlyph.className):
					{
						const compositeResult = calculateCompositeGlyph(glyph, 1);

						this.maxComponentContours = Math.max(this.maxComponentContours, compositeResult.componentContours);
						this.maxComponentPoints = Math.max(this.maxComponentPoints, compositeResult.componentPoints);
						this.maxComponentDepth = Math.max(this.maxComponentDepth, compositeResult.componentDepth);

						this.maxSizeOfInstructions = Math.max(this.maxSizeOfInstructions, compositeResult.sizeOfInstructions);
					}
					break;
				default:
			}
		}
		//endregion

		this.maxComponentElements = referencedGlyphs.size;
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
		stream.appendUint32(this.version);
		stream.appendUint16(this.numGlyphs);

		switch(this.version)
		{
			case 0x00010000:
				stream.appendUint16(this.maxPoints);
				stream.appendUint16(this.maxContours);
				stream.appendUint16(this.maxComponentPoints);
				stream.appendUint16(this.maxComponentContours);
				stream.appendUint16(this.maxZones);
				stream.appendUint16(this.maxTwilightPoints);
				stream.appendUint16(this.maxStorage);
				stream.appendUint16(this.maxFunctionDefs);
				stream.appendUint16(this.maxInstructionDefs);
				stream.appendUint16(this.maxStackElements);
				stream.appendUint16(this.maxSizeOfInstructions);
				stream.appendUint16(this.maxComponentElements);
				stream.appendUint16(this.maxComponentDepth);

				break;
			case 0x00005000:
				break;
			default:
				throw new Error(`Incorrect version for MAXP - ${this.version}`);
		}

		return true;
	}
	//**********************************************************************************
	/**
	 * Convert SeqStream data to object
	 * @param {!SeqStream} stream
	 * @returns {*} Result of the function
	 */
	static fromStream(stream)
	{
		const version = stream.getUint32();
		const numGlyphs = stream.getUint16();

		switch(version)
		{
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
	//**********************************************************************************
}
//**************************************************************************************
