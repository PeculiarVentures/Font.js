import { BaseClass } from "../BaseClass.js";
//**************************************************************************************
export class MAXP extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.version = parameters.version || 0x00010000;
		this.numGlyphs = parameters.numGlyphs || 0;

		if(this.version === 0x00010000)
		{
			this.maxPoints = parameters.maxPoints || 0;
			this.maxContours = parameters.maxContours || 0;
			this.maxComponentPoints = parameters.maxComponentPoints || 0;
			this.maxComponentContours = parameters.maxComponentContours || 0;
			this.maxZones = parameters.maxZones || 0;
			this.maxTwilightPoints = parameters.maxTwilightPoints || 0;
			this.maxStorage = parameters.maxStorage || 0;
			this.maxFunctionDefs = parameters.maxFunctionDefs || 0;
			this.maxInstructionDefs = parameters.maxInstructionDefs || 0;
			this.maxStackElements = parameters.maxStackElements || 0;
			this.maxSizeOfInstructions = parameters.maxSizeOfInstructions || 0;
			this.maxComponentElements = parameters.maxComponentElements || 0;
			this.maxComponentDepth = parameters.maxComponentDepth || 0;
		}
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x6D617870;
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
