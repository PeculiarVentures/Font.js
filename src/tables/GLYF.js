import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass.js";
import { Matrix } from "../Matrix.js";
import { getF2Dot14, appendF2Dot14, checkFlag } from "../common.js";
//**************************************************************************************
export class SimpleGlyphFlags
{
	//**********************************************************************************
	constructor()
	{
		throw new Error("Only static methods allowed for SimpleGlyphFlags");
	}
	//**********************************************************************************
	/**
	 * Bit 0: If set, the point is on the curve; otherwise, it is off the curve
	 *
	 * @return {number}
	 */
	static get ON_CURVE_POINT()
	{
		return 0x01;
	}
	//**********************************************************************************
	/**
	 * Bit 1: If set, the corresponding x-coordinate is 1 byte long. If not set, it is two
	 * bytes long. For the sign of this value, see the description of the X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR flag.
	 *
	 * @return {number}
	 */
	static get X_SHORT_VECTOR()
	{
		return 0x02;
	}
	//**********************************************************************************
	/**
	 * Bit 2: If set, the corresponding y-coordinate is 1 byte long. If not set, it is two
	 * bytes long. For the sign of this value, see the description of the Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR flag.
	 *
	 * @return {number}
	 */
	static get Y_SHORT_VECTOR()
	{
		return 0x04;
	}
	//**********************************************************************************
	/**
	 * Bit 3: If set, the next byte (read as unsigned) specifies the number of additional
	 * times this flag byte is to be repeated in the logical flags array — that is, the
	 * number of additional logical flag entries inserted after this entry. (In the expanded
	 * logical array, this bit is ignored.) In this way, the number of flags listed can be
	 * smaller than the number of points in the glyph description
	 *
	 * @return {number}
	 */
	static get REPEAT_FLAG()
	{
		return 0x08;
	}
	//**********************************************************************************
	/**
	 * Bit 4: This flag has two meanings, depending on how the X_SHORT_VECTOR flag is set.
	 * If X_SHORT_VECTOR is set, this bit describes the sign of the value, with 1 equalling
	 * positive and 0 negative. If X_SHORT_VECTOR is not set and this bit is set, then the
	 * current x-coordinate is the same as the previous x-coordinate. If X_SHORT_VECTOR is
	 * not set and this bit is also not set, the current x-coordinate is a signed 16-bit
	 * delta vector
	 *
	 * @return {number}
	 */
	static get X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR()
	{
		return 0x10;
	}
	//**********************************************************************************
	/**
	 * Bit 5: This flag has two meanings, depending on how the Y_SHORT_VECTOR flag is set.
	 * If Y_SHORT_VECTOR is set, this bit describes the sign of the value, with 1 equalling
	 * positive and 0 negative. If Y_SHORT_VECTOR is not set and this bit is set, then the
	 * current y-coordinate is the same as the previous y-coordinate. If Y_SHORT_VECTOR is
	 * not set and this bit is also not set, the current y-coordinate is a signed 16-bit
	 * delta vector
	 *
	 * @return {number}
	 */
	static get Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR()
	{
		return 0x20;
	}
	//**********************************************************************************
	/**
	 * Bit 6: If set, contours in the glyph description may overlap. Use of this flag is
	 * not required in OpenType — that is, it is valid to have contours overlap without
	 * having this flag set. It may affect behaviors in some platforms, however. (See the
	 * discussion of “Overlapping contours” in Apple’s specification for details regarding
	 * behavior in Apple platforms.) When used, it must be set on the first flag byte for
	 * the glyph.
	 *
	 * @return {number}
	 */
	static get OVERLAP_SIMPLE()
	{
		return 0x40;
	}
	//**********************************************************************************
}
//**************************************************************************************
export class ComponentGlyphFlags
{
	//**********************************************************************************
	constructor()
	{
		throw new Error("Only static methods allowed for ComponentGlyphFlags");
	}
	//**********************************************************************************
	/**
	 * If set, the arguments are words; If not set, they are bytes
	 *
	 * @return {number}
	 */
	static get ARG_1_AND_2_ARE_WORDS()
	{
		return 0x0001; // bit 0
	}
	//**********************************************************************************
	/**
	 * If set, the arguments are xy values; If not set, they are points
	 *
	 * @return {number}
	 */
	static get ARGS_ARE_XY_VALUES()
	{
		return 0x0002; // bit 1
	}
	//**********************************************************************************
	/**
	 * If set, round the xy values to grid; if not set do not round xy values to grid
	 * (relevant only to bit 1 is set)
	 *
	 * @return {number}
	 */
	static get ROUND_XY_TO_GRID()
	{
		return 0x0004; // bit 2
	}
	//**********************************************************************************
	/**
	 * If set, there is a simple scale for the component; If not set, scale is 1.0
	 *
	 * @return {number}
	 */
	static get WE_HAVE_A_SCALE()
	{
		return 0x0008; // bit 3
	}
	//**********************************************************************************
	/**
	 * If set, at least one additional glyph follows this one
	 *
	 * @return {number}
	 */
	static get MORE_COMPONENTS()
	{
		return 0x0020; // bit 5
	}
	//**********************************************************************************
	/**
	 * If set the x direction will use a different scale than the y direction
	 *
	 * @return {number}
	 */
	static get WE_HAVE_AN_X_AND_Y_SCALE()
	{
		return 0x0040; // bit 6
	}
	//**********************************************************************************
	/**
	 * If set there is a 2-by-2 transformation that will be used to scale the component
	 *
	 * @return {number}
	 */
	static get WE_HAVE_A_TWO_BY_TWO()
	{
		return 0x0080; // bit 7
	}
	//**********************************************************************************
	/**
	 * If set, instructions for the component character follow the last component
	 *
	 * @return {number}
	 */
	static get WE_HAVE_INSTRUCTIONS()
	{
		return 0x0100; // bit 8
	}
	//**********************************************************************************
	/**
	 * Use metrics from this component for the compound glyph
	 *
	 * @return {number}
	 */
	static get USE_MY_METRICS()
	{
		return 0x0200; // bit 9
	}
	//**********************************************************************************
	/**
	 * If set, the components of this compound glyph overlap
	 *
	 * @return {number}
	 */
	static get OVERLAP_COMPOUND()
	{
		return 0x0400; // bit 10
	}
	//**********************************************************************************
	/**
	 * Bit 11: The composite is designed to have the component offset scaled
	 *
	 * @return {number}
	 */
	static get SCALED_COMPONENT_OFFSET()
	{
		return 0x0800; // bit 11
	}
	//**********************************************************************************
	/**
	 * Bit 12: The composite is designed not to have the component offset scaled
	 *
	 * @return {number}
	 */
	static get UNSCALED_COMPONENT_OFFSET()
	{
		return 0x1000; // bit 12
	}
	//**********************************************************************************
}
//**************************************************************************************
export class Glyph extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.glyphs = parameters.glyphs || [];
	}
	//**********************************************************************************
	static get className()
	{
		return "Glyph";
	}
	//**********************************************************************************
}
//**************************************************************************************
export class GLYF extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.glyphs = parameters.glyphs || [];
	}
	//**********************************************************************************
	static get className()
	{
		return "GLYF";
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x676C7966;
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
		this.loca = [0];

		for(const glyph of this.glyphs)
		{
			//region Check we do have something to put
			if(glyph.numberOfContours === 0)
			{
				this.loca.push(this.loca[this.loca.length - 1]);
				continue;
			}
			//endregion

			//region Store previous length of the stream
			const prevLength = stream.length;
			//endregion

			//region Put main values
			stream.appendInt16(glyph.numberOfContours);
			stream.appendInt16(glyph.xMin);
			stream.appendInt16(glyph.yMin);
			stream.appendInt16(glyph.xMax);
			stream.appendInt16(glyph.yMax);
			//endregion

			//region Work with simple glyph
			if(glyph.numberOfContours > 0)
			{
				//region Check consistency
				const numberOfCoordinates = glyph.endPtsOfContours[glyph.endPtsOfContours.length - 1] + 1;

				if(glyph.flags.length !== numberOfCoordinates)
					throw new Error("Inconsistency between length of 'flags' and 'endPtsOfContours' values");

				if(glyph.xCoordinates.length !== numberOfCoordinates)
					throw new Error("Inconsistency between length of 'xCoordinates' and 'endPtsOfContours' values");

				if(glyph.yCoordinates.length !== numberOfCoordinates)
					throw new Error("Inconsistency between length of 'yCoordinates' and 'endPtsOfContours' values");
				//endregion

				//region Put "endPtsOfContours" values
				for(const endPtOfContour of glyph.endPtsOfContours)
					stream.appendUint16(endPtOfContour);
				//endregion

				//region Put "instructions" values
				stream.appendUint16(glyph.instructions.length);

				if(glyph.instructions.length)
					stream.appendView(new Uint8Array(glyph.instructions));
				//endregion

				//region Put "flags" values
				const flagBytes = [];

				for(let i = 0; i < glyph.flags.length;)
				{
					let flag = glyph.flags[i];

					if(checkFlag(flag, SimpleGlyphFlags.REPEAT_FLAG))
					{
						let repeatCount = 0;

						// noinspection AssignmentToForLoopParameterJS
						for (i++; i < glyph.flags.length; i++, repeatCount++)
						{
							if (glyph.flags[i] !== flag)
								break;
						}

						if (repeatCount)
						{
							flagBytes.push(flag);
							flagBytes.push(repeatCount);
						}
						else
						{
							flag &= ~SimpleGlyphFlags.REPEAT_FLAG;
							flagBytes.push(flag);
						}

					}
					else
					{
						flagBytes.push(flag);
						// noinspection AssignmentToForLoopParameterJS
						i++;
					}
				}

				stream.appendView(new Uint8Array(flagBytes));
				//endregion

				//region Put X coordinates
				let p = 0;

				for(let i = 0; i < glyph.xCoordinates.length; i++)
				{
					const flag = glyph.flags[i];

					let x = glyph.xCoordinates[i];
					let real = x;

					if((flag & SimpleGlyphFlags.X_SHORT_VECTOR) === SimpleGlyphFlags.X_SHORT_VECTOR)
					{
						if((flag & SimpleGlyphFlags.X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR) === 0)
						{
							x = (-x);
							p = (-p);
						}

						x -= p;

						stream.appendView(new Uint8Array([x]));
					}
					else
					{
						if((flag & SimpleGlyphFlags.X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR) === SimpleGlyphFlags.X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR)
							x = p;
						else
						{
							x -= p;

							stream.appendInt16(x);
						}
					}

					p = real;
				}
				//endregion

				//region Put Y coordinates
				p = 0;

				for(let i = 0; i < glyph.yCoordinates.length; i++)
				{
					const flag = glyph.flags[i];

					let y = glyph.yCoordinates[i];
					let real = y;

					if((flag & SimpleGlyphFlags.Y_SHORT_VECTOR) === SimpleGlyphFlags.Y_SHORT_VECTOR)
					{
						if((flag & SimpleGlyphFlags.Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR) === 0)
						{
							y = (-y);
							p = (-p);
						}

						y -= p;

						stream.appendView(new Uint8Array([y]));
					}
					else
					{
						if((flag & SimpleGlyphFlags.Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR) === SimpleGlyphFlags.Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR)
							y = p;
						else
						{
							y -= p;

							stream.appendInt16(y);
						}
					}

					p = real;
				}
				//endregion

				//region Padding to even length
				if((stream.length - prevLength) %2)
					stream.appendView(new Uint8Array([0]));
				//endregion
			}
			//endregion
			//region Work with compound glyphs
			else
			{
				//region Store information about components
				for(let i = 0; i < glyph.components.length; i++)
				{
					const component = glyph.components[i];

					//region Set correct "flags" value
					let flags = component.flags;

					if((typeof component.matchingPoint1 !== "undefined") || (typeof component.matchingPoint2 !== "undefined"))
					{
						flags &= ~ComponentGlyphFlags.ARGS_ARE_XY_VALUES;

						if((component.matchingPoint1 > 255) ||
							(component.matchingPoint1 < 0) ||
							(component.matchingPoint2 > 255) ||
							(component.matchingPoint2 < 0))
							flags |= ComponentGlyphFlags.ARG_1_AND_2_ARE_WORDS;
						else
							flags &= ~ComponentGlyphFlags.ARG_1_AND_2_ARE_WORDS;
					}
					else
					{
						flags |= ComponentGlyphFlags.ARGS_ARE_XY_VALUES;

						if((component.matrix.e > 255) ||
							(component.matrix.e < 0) ||
							(component.matrix.f > 255) ||
							(component.matrix.f < 0))
							flags |= ComponentGlyphFlags.ARG_1_AND_2_ARE_WORDS;
						else
						{
							flags &= ~ComponentGlyphFlags.ARG_1_AND_2_ARE_WORDS;
						}
					}

					if(component.matrix.b || component.matrix.c)
						flags |= ComponentGlyphFlags.WE_HAVE_A_TWO_BY_TWO;
					else
					{
						if((component.matrix.a !== 1) || (component.matrix.d !== 1))
						{
							if(component.matrix.a !== component.matrix.d)
								flags |= ComponentGlyphFlags.WE_HAVE_AN_X_AND_Y_SCALE;
							else
								flags |= ComponentGlyphFlags.WE_HAVE_A_SCALE;
						}
					}

					if(i < (glyph.components.length - 1))
						flags |= ComponentGlyphFlags.MORE_COMPONENTS;
					//endregion

					//region Store informatin about flags and glyph index first
					stream.appendUint16(flags);
					stream.appendUint16(component.glyphIndex);
					//endregion

					//region Store translation coordinates
					switch(true)
					{
						case (checkFlag(flags, ComponentGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, ComponentGlyphFlags.ARGS_ARE_XY_VALUES)):
							stream.appendInt16(component.matrix.e);
							stream.appendInt16(component.matrix.f);

							break;
						case (!checkFlag(flags, ComponentGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, ComponentGlyphFlags.ARGS_ARE_XY_VALUES)):
							stream.appendView(new Uint8Array([component.matrix.e]));
							stream.appendView(new Uint8Array([component.matrix.f]));

							break;
						case (checkFlag(flags, ComponentGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, ComponentGlyphFlags.ARGS_ARE_XY_VALUES)):
							stream.appendInt16(component.matchingPoint1);
							stream.appendInt16(component.matchingPoint2);

							break;
						case (!checkFlag(flags, ComponentGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, ComponentGlyphFlags.ARGS_ARE_XY_VALUES)):
							stream.appendView(new Uint8Array([component.matchingPoint1]));
							stream.appendView(new Uint8Array([component.matchingPoint2]));

							break;
					}
					//endregion

					//region Store scaling and rotation details
					switch(true)
					{
						case checkFlag(flags, ComponentGlyphFlags.WE_HAVE_A_SCALE):
							appendF2Dot14(component.matrix.a, stream);

							break;
						case checkFlag(flags, ComponentGlyphFlags.WE_HAVE_AN_X_AND_Y_SCALE):
							appendF2Dot14(component.matrix.a, stream);
							appendF2Dot14(component.matrix.d, stream);

							break;
						case checkFlag(flags, ComponentGlyphFlags.WE_HAVE_A_TWO_BY_TWO):
							appendF2Dot14(component.matrix.a, stream);
							appendF2Dot14(component.matrix.b, stream);
							appendF2Dot14(component.matrix.c, stream);
							appendF2Dot14(component.matrix.d, stream);

							break;
					}
					//endregion
				}
				//endregion

				//region Store information about instruction
				stream.appendUint16(glyph.instructions.length);

				if(glyph.instructions.length)
					stream.appendView(new Uint8Array(glyph.instructions));
				//endregion
			}
			//endregion

			//region Update "loca" table
			this.loca.push(stream.length - prevLength + this.loca[this.loca.length - 1]);
			//endregion
		}

		return true;
	}
	//**********************************************************************************
	/**
	 * Convert SeqStream data to object
	 *
	 * @param {!number} numGlyphs Value from 'maxp' table
	 * @param {!LOCA} loca Reference to 'loca' table
	 * @param {!SeqStream} stream
	 *
	 * @returns {*} Result of the function
	 */
	static fromStream(numGlyphs, loca, stream)
	{
		//region Make streams for all glyphs
		if(numGlyphs !== (loca.offsets.length - 1))
			throw new Error(`Inconsistent values: numGlyphs (${numGlyphs}) !== (loca.offsets.length - 1) (${loca.offsets.length - 1})`);

		const streams = [];

		for(let i = 1; i < loca.offsets.length; i++)
		{
			// Could be situation when there is big LOCA but for most of
			// the glyphs there are zero lengths
			if(loca.offsets[i - 1] >= stream.length)
			{
				streams.push(new SeqStream());
				continue;
			}

			streams.push(new SeqStream({ stream: stream.stream.slice(loca.offsets[i - 1], loca.offsets[i]) }));
		}
		//endregion

		//region Initial variables
		const glyphs = [];
		//endregion

		//region Parse all glyphs
		for(const glyphStream of streams)
		{
			//region Fill main values
			const numberOfContours = glyphStream.getInt16();
			const xMin = glyphStream.getInt16();
			const yMin = glyphStream.getInt16();
			const xMax = glyphStream.getInt16();
			const yMax = glyphStream.getInt16();
			//endregion

			switch(true)
			{
				case (numberOfContours === 0):
					glyphs.push({
						glyphStream,
						numberOfContours,
						xMin,
						yMin,
						xMax,
						yMax
					});

					break;
				case (numberOfContours > 0):
					{
						//region Initial variables
						const endPtsOfContours = [];
						const instructions = [];
						const flags = [];
						const xCoordinates = [];
						const yCoordinates = [];
						//endregion

						//region Fill "endPtsOfContours"
						for(let i = 0; i < numberOfContours; i++)
						{
							const endPtOfContour = glyphStream.getUint16();
							endPtsOfContours.push(endPtOfContour);
						}
						//endregion

						//region Fill "instructions"
						const instructionLength = glyphStream.getUint16();

						for(let i = 0; i < instructionLength; i++)
						{
							const instruction = glyphStream.getBlock(1);
							instructions.push(instruction[0]);
						}
						//endregion

						//region Fill "flags"
						const numberOfCoordinates = endPtsOfContours[endPtsOfContours.length - 1] + 1;
						
						for(let i = 0; i < numberOfCoordinates; i++)
						{
							const flag = glyphStream.getBlock(1);
							flags.push(flag[0]);

							// noinspection JSBitwiseOperatorUsage
							if(flag[0] & SimpleGlyphFlags.REPEAT_FLAG)
							{
								const repeatCount = glyphStream.getBlock(1);
								for(let j = 0; j < repeatCount[0]; j++)
								{
									flags.push(flag[0]);
									i += 1;
								}
							}
						}
						//endregion

						//region Put correct flags at all beggining of contours
						flags[0] |= SimpleGlyphFlags.OVERLAP_SIMPLE;

						for(let i = 0; i < (endPtsOfContours.length - 1); i++)
							flags[endPtsOfContours[i] + 1] |= SimpleGlyphFlags.OVERLAP_SIMPLE;
						//endregion

						//region Fill X coordinates
						let p = 0;

						for(const flag of flags)
						{
							let x = 0;

							if((flag & SimpleGlyphFlags.X_SHORT_VECTOR) === SimpleGlyphFlags.X_SHORT_VECTOR)
							{
								x = (glyphStream.getBlock(1))[0];

								if((flag & SimpleGlyphFlags.X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR) === 0)
									x = (-x);

								x += p;
							}
							else
							{
								if((flag & SimpleGlyphFlags.X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR) === SimpleGlyphFlags.X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR)
									x = p;
								else
									x = p + glyphStream.getInt16();
							}

							xCoordinates.push(x);

							p = x;
						}
						//endregion

						//region Fill Y coordinates
						p = 0;

						for(const flag of flags)
						{
							let y = 0;

							if((flag & SimpleGlyphFlags.Y_SHORT_VECTOR) === SimpleGlyphFlags.Y_SHORT_VECTOR)
							{
								y = (glyphStream.getBlock(1))[0];

								if((flag & SimpleGlyphFlags.Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR) === 0)
									y = (-y);

								y += p;
							}
							else
							{
								if((flag & SimpleGlyphFlags.Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR) === SimpleGlyphFlags.Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR)
									y = p;
								else
									y = p + glyphStream.getInt16();
							}

							yCoordinates.push(y);

							p = y;
						}
						//endregion

						glyphs.push({
							glyphStream,
							numberOfContours,
							xMin,
							yMin,
							xMax,
							yMax,
							endPtsOfContours,
							instructions,
							flags,
							xCoordinates,
							yCoordinates
						});
					}

					break;
				case (numberOfContours < 0):
					{
						//region Initial variables
						let flags = 0;
						const instructions = [];
						const components = [];
						//endregion

						//region Read components
						do
						{
							//region Initial variables
							const matrix = new Matrix();

							let matchingPoint1 = null;
							let matchingPoint2 = null;
							//endregion

							//region Read basic information
							flags = glyphStream.getUint16();
							const glyphIndex = glyphStream.getUint16();
							//endregion

							//region Read translation coordinates
							switch(true)
							{
								case (checkFlag(flags, ComponentGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, ComponentGlyphFlags.ARGS_ARE_XY_VALUES)):
									matrix.e = glyphStream.getInt16();
									matrix.f = glyphStream.getInt16();

									break;
								case (!checkFlag(flags, ComponentGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, ComponentGlyphFlags.ARGS_ARE_XY_VALUES)):
									matrix.e = (glyphStream.getBlock(1))[0];
									matrix.f = (glyphStream.getBlock(1))[0];

									break;
								case (checkFlag(flags, ComponentGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, ComponentGlyphFlags.ARGS_ARE_XY_VALUES)):
									matchingPoint1 = glyphStream.getInt16();
									matchingPoint2 = glyphStream.getInt16();

									break;
								case (!checkFlag(flags, ComponentGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, ComponentGlyphFlags.ARGS_ARE_XY_VALUES)):
									matchingPoint1 = (glyphStream.getBlock(1))[0];
									matchingPoint2 = (glyphStream.getBlock(1))[0];

									break;
							}
							//endregion

							//region Read scaling and rotation details
							switch(true)
							{
								case checkFlag(flags, ComponentGlyphFlags.WE_HAVE_A_SCALE):
									matrix.a = getF2Dot14(glyphStream);
									matrix.d = matrix.a;

									break;
								case checkFlag(flags, ComponentGlyphFlags.WE_HAVE_AN_X_AND_Y_SCALE):
									matrix.a = getF2Dot14(glyphStream);
									matrix.d = getF2Dot14(glyphStream);

									break;
								case checkFlag(flags, ComponentGlyphFlags.WE_HAVE_A_TWO_BY_TWO):
									matrix.a = getF2Dot14(glyphStream);
									matrix.b = getF2Dot14(glyphStream);
									matrix.c = getF2Dot14(glyphStream);
									matrix.d = getF2Dot14(glyphStream);

									break;
							}
							//endregion

							const componentParameters = {
								glyphIndex,
								flags,
								matrix
							};

							if(matchingPoint1 !== null)
							{
								componentParameters.matchingPoint1 = matchingPoint1;
								componentParameters.matchingPoint2 = matchingPoint2;
							}

							components.push(
								componentParameters
							);

						}while(checkFlag(flags, ComponentGlyphFlags.MORE_COMPONENTS));
						//endregion

						//region Read instructions
						if(checkFlag(flags, ComponentGlyphFlags.WE_HAVE_INSTRUCTIONS))
						{
							const numInstr = glyphStream.getUint16();

							for(let i = 0; i < numInstr; i++)
							{
								const instruction = (glyphStream.getBlock(1))[0];
								instructions.push(instruction);
							}
						}
						//endregion

						glyphs.push({
							glyphStream,
							numberOfContours,
							xMin,
							yMin,
							xMax,
							yMax,
							components,
							instructions
						});
					}

					break;
			}
		}
		//endregion

		return new GLYF({
			glyphs
		});
	}
	//**********************************************************************************
}
//**************************************************************************************
