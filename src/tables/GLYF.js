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
export class CompoundGlyphFlags
{
	//**********************************************************************************
	constructor()
	{
		throw new Error("Only static methods allowed for CompoundGlyphFlags");
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

		this.stream = parameters.stream || new SeqStream();

		if("numberOfContours" in parameters)
			this.numberOfContours = parameters.numberOfContours;
		if("xMin" in parameters)
			this.xMin = parameters.xMin;
		if("yMin" in parameters)
			this.yMin = parameters.yMin;
		if("xMax" in parameters)
			this.xMax = parameters.xMax;
		if("yMax" in parameters)
			this.yMax = parameters.yMax;
	}
	//**********************************************************************************
	static get className()
	{
		return "Glyph";
	}
	//**********************************************************************************
	static new(stream)
	{
		const numberOfContours = stream.getInt16();
		stream.resetPosition();

		switch(true)
		{
			case (numberOfContours === 0):
				return new EmptyGlyph({ stream });
			case (numberOfContours > 0):
				return new SimpleGlyph({ stream });
			case (numberOfContours < 0):
				return new CompoundGlyph({ stream });
		}
	}
	//**********************************************************************************
	decode()
	{
		this.numberOfContours = this.stream.getInt16();
		this.xMin = this.stream.getInt16();
		this.yMin = this.stream.getInt16();
		this.xMax = this.stream.getInt16();
		this.yMax = this.stream.getInt16();
	}
	//**********************************************************************************
	encode(stream)
	{
		if("_numberOfContours" in this === false)
			this.decode();

		stream.appendInt16(this.numberOfContours);
		stream.appendInt16(this.xMin);
		stream.appendInt16(this.yMin);
		stream.appendInt16(this.xMax);
		stream.appendInt16(this.yMax);
	}
	//**********************************************************************************
	get numberOfContours()
	{
		if("_numberOfContours" in this === false)
			this.decode();

		return this._numberOfContours;
	}
	//**********************************************************************************
	set numberOfContours(value)
	{
		this._numberOfContours = value;
	}
	//**********************************************************************************
	get xMin()
	{
		if("_xMin" in this === false)
			this.decode();

		return this._xMin;
	}
	//**********************************************************************************
	set xMin(value)
	{
		this._xMin = value;
	}
	//**********************************************************************************
	get yMin()
	{
		if("_yMin" in this === false)
			this.decode();

		return this._yMin;
	}
	//**********************************************************************************
	set yMin(value)
	{
		this._yMin = value;
	}
	//**********************************************************************************
	get xMax()
	{
		if("_xMax" in this === false)
			this.decode();

		return this._xMax;
	}
	//**********************************************************************************
	set xMax(value)
	{
		this._xMax = value;
	}
	//**********************************************************************************
	get yMax()
	{
		if("_yMax" in this === false)
			this.decode();

		return this._yMax;
	}
	//**********************************************************************************
	set yMax(value)
	{
		this._yMax = value;
	}
	//**********************************************************************************
}
//**************************************************************************************
export class EmptyGlyph extends Glyph
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);
	}
	//**********************************************************************************
	static get className()
	{
		return "EmptyGlyph";
	}
	//**********************************************************************************
	decode()
	{
		super.decode();

		if(this.numberOfContours !== 0)
			throw new Error(`Incorrect numberOfContours for EmptyGlyph class: ${this.numberOfContours}`);
	}
	//**********************************************************************************
	encode(stream)
	{
		// Nothing should be encoded here
	}
	//**********************************************************************************
}
//**************************************************************************************
export class SimpleGlyph extends Glyph
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		if("endPtsOfContours" in parameters)
			this.endPtsOfContours = parameters.endPtsOfContours;
		if("instructions" in parameters)
			this.instructions = parameters.instructions;
		if("flags" in parameters)
			this.flags = parameters.flags;
		if("xCoordinates" in parameters)
			this.xCoordinates = parameters.xCoordinates;
		if("yCoordinates" in parameters)
			this.yCoordinates = parameters.yCoordinates;
	}
	//**********************************************************************************
	static get className()
	{
		return "SimpleGlyph";
	}
	//**********************************************************************************
	decode()
	{
		super.decode();

		//region Check we have a correct numberOfContours
		if((this.numberOfContours === 0) || (this.numberOfContours < 0))
			throw new Error(`Incorrect numberOfContours for SimpleGlyph class: ${this.numberOfContours}`);
		//endregion

		//region Initial variables
		this.endPtsOfContours = [];
		this.instructions = [];
		this.flags = [];
		this.xCoordinates = [];
		this.yCoordinates = [];
		//endregion

		//region Fill "endPtsOfContours"
		for(let i = 0; i < this.numberOfContours; i++)
		{
			const endPtOfContour = this.stream.getUint16();
			this.endPtsOfContours.push(endPtOfContour);
		}
		//endregion

		//region Fill "instructions"
		const instructionLength = this.stream.getUint16();

		for(let i = 0; i < instructionLength; i++)
		{
			const instruction = this.stream.getBlock(1);
			this.instructions.push(instruction[0]);
		}
		//endregion

		const numberOfCoordinates = this.endPtsOfContours[this.endPtsOfContours.length - 1] + 1;
		//region Fill "flags"

		for(let i = 0; i < numberOfCoordinates; i++)
		{
			const flag = this.stream.getBlock(1);
			this.flags.push(flag[0]);

			if(flag[0] & SimpleGlyphFlags.REPEAT_FLAG)
			{
				const repeatCount = this.stream.getBlock(1);
				for(let j = 0; j < repeatCount[0]; j++)
				{
					this.flags.push(flag[0]);
					i += 1;
				}
			}
		}
		//endregion

		//region Put correct flags at all beggining of contours
		this.flags[0] |= SimpleGlyphFlags.OVERLAP_SIMPLE;

		for(let i = 0; i < (this.endPtsOfContours.length - 1); i++)
			this.flags[this.endPtsOfContours[i] + 1] |= SimpleGlyphFlags.OVERLAP_SIMPLE;
		//endregion

		//region Fill X coordinates
		let p = 0;

		for(const flag of this.flags)
		{
			let x = 0;

			if((flag & SimpleGlyphFlags.X_SHORT_VECTOR) === SimpleGlyphFlags.X_SHORT_VECTOR)
			{
				x = (this.stream.getBlock(1))[0];

				if((flag & SimpleGlyphFlags.X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR) === 0)
					x = (-x);

				x += p;
			}
			else
			{
				if((flag & SimpleGlyphFlags.X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR) === SimpleGlyphFlags.X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR)
					x = p;
				else
					x = p + this.stream.getInt16();
			}

			this.xCoordinates.push(x);

			p = x;
		}
		//endregion

		//region Fill Y coordinates
		p = 0;

		for(const flag of this.flags)
		{
			let y = 0;

			if((flag & SimpleGlyphFlags.Y_SHORT_VECTOR) === SimpleGlyphFlags.Y_SHORT_VECTOR)
			{
				y = (this.stream.getBlock(1))[0];

				if((flag & SimpleGlyphFlags.Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR) === 0)
					y = (-y);

				y += p;
			}
			else
			{
				if((flag & SimpleGlyphFlags.Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR) === SimpleGlyphFlags.Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR)
					y = p;
				else
					y = p + this.stream.getInt16();
			}

			this.yCoordinates.push(y);

			p = y;
		}
		//endregion
	}
	//**********************************************************************************
	encode(stream)
	{
		super.encode(stream);

		//region Store previous length of the stream
		const prevLength = stream.length;
		//endregion

		//region Check consistency
		const numberOfCoordinates = this.endPtsOfContours[this.endPtsOfContours.length - 1] + 1;

		if(this.flags.length !== numberOfCoordinates)
			throw new Error("Inconsistency between length of 'flags' and 'endPtsOfContours' values");

		if(this.xCoordinates.length !== numberOfCoordinates)
			throw new Error("Inconsistency between length of 'xCoordinates' and 'endPtsOfContours' values");

		if(this.yCoordinates.length !== numberOfCoordinates)
			throw new Error("Inconsistency between length of 'yCoordinates' and 'endPtsOfContours' values");
		//endregion

		//region Put "endPtsOfContours" values
		for(const endPtOfContour of this.endPtsOfContours)
			stream.appendUint16(endPtOfContour);
		//endregion

		//region Put "instructions" values
		stream.appendUint16(this.instructions.length);

		if(this.instructions.length)
			stream.appendView(new Uint8Array(this.instructions));
		//endregion

		//region Put "flags" values
		const flagBytes = [];

		for(let i = 0; i < this.flags.length;)
		{
			let flag = this.flags[i];

			if(checkFlag(flag, SimpleGlyphFlags.REPEAT_FLAG))
			{
				let repeatCount = 0;

				for (i++; i < this.flags.length; i++, repeatCount++)
				{
					if (this.flags[i] !== flag)
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
				i++;
			}
		}

		stream.appendView(new Uint8Array(flagBytes));
		//endregion

		//region Put X coordinates
		let p = 0;

		for(let i = 0; i < this.xCoordinates.length; i++)
		{
			const flag = this.flags[i];

			let x = this.xCoordinates[i];
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

		for(let i = 0; i < this.yCoordinates.length; i++)
		{
			const flag = this.flags[i];

			let y = this.yCoordinates[i];
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
	//**********************************************************************************
	get endPtsOfContours()
	{
		if("_endPtsOfContours" in this === false)
			this.decode();

		return this._endPtsOfContours;
	}
	//**********************************************************************************
	set endPtsOfContours(value)
	{
		this._endPtsOfContours = value;
	}
	//**********************************************************************************
	get instructions()
	{
		if("_instructions" in this === false)
			this.decode();

		return this._instructions;
	}
	//**********************************************************************************
	set instructions(value)
	{
		this._instructions = value;
	}
	//**********************************************************************************
	get flags()
	{
		if("_flags" in this === false)
			this.decode();

		return this._flags;
	}
	//**********************************************************************************
	set flags(value)
	{
		this._flags = value;
	}
	//**********************************************************************************
	get xCoordinates()
	{
		if("_xCoordinates" in this === false)
			this.decode();

		return this._xCoordinates;
	}
	//**********************************************************************************
	set xCoordinates(value)
	{
		this._xCoordinates = value;
	}
	//**********************************************************************************
	get yCoordinates()
	{
		if("_yCoordinates" in this === false)
			this.decode();

		return this._yCoordinates;
	}
	//**********************************************************************************
	set yCoordinates(value)
	{
		this._yCoordinates = value;
	}
	//**********************************************************************************
}
//**************************************************************************************
export class CompoundGlyph extends Glyph
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super(parameters);

		if("components" in parameters)
			this.components = parameters.components;
		if("instructions" in parameters)
			this.instructions = parameters.instructions;
	}
	//**********************************************************************************
	static get className()
	{
		return "CompoundGlyph";
	}
	//**********************************************************************************
	decode()
	{
		super.decode();

		//region Check we have a correct numberOfContours
		if((this.numberOfContours === 0) || (this.numberOfContours > 0))
			throw new Error(`Incorrect numberOfContours for CompoundGlyph class: ${this.numberOfContours}`);
		//endregion

		//region Initial variables
		let flags = 0;
		this.instructions = [];
		this.components = [];
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
			flags = this.stream.getUint16();
			const glyphIndex = this.stream.getUint16();
			//endregion

			//region Read translation coordinates
			switch(true)
			{
				case (checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
					matrix.e = this.stream.getInt16();
					matrix.f = this.stream.getInt16();

					break;
				case (!checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
					matrix.e = (this.stream.getBlock(1))[0];
					matrix.f = (this.stream.getBlock(1))[0];

					break;
				case (checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
					matchingPoint1 = this.stream.getInt16();
					matchingPoint2 = this.stream.getInt16();

					break;
				case (!checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
					matchingPoint1 = (this.stream.getBlock(1))[0];
					matchingPoint2 = (this.stream.getBlock(1))[0];

					break;
			}
			//endregion

			//region Read scaling and rotation details
			switch(true)
			{
				case checkFlag(flags, CompoundGlyphFlags.WE_HAVE_A_SCALE):
					matrix.a = getF2Dot14(this.stream);
					matrix.d = matrix.a;

					break;
				case checkFlag(flags, CompoundGlyphFlags.WE_HAVE_AN_X_AND_Y_SCALE):
					matrix.a = getF2Dot14(this.stream);
					matrix.d = getF2Dot14(this.stream);

					break;
				case checkFlag(flags, CompoundGlyphFlags.WE_HAVE_A_TWO_BY_TWO):
					matrix.a = getF2Dot14(this.stream);
					matrix.b = getF2Dot14(this.stream);
					matrix.c = getF2Dot14(this.stream);
					matrix.d = getF2Dot14(this.stream);

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

			this.components.push(
				componentParameters
			);

		}while(checkFlag(flags, CompoundGlyphFlags.MORE_COMPONENTS));
		//endregion

		//region Read instructions
		if(checkFlag(flags, CompoundGlyphFlags.WE_HAVE_INSTRUCTIONS))
		{
			const numInstr = this.stream.getUint16();

			for(let i = 0; i < numInstr; i++)
			{
				const instruction = (this.stream.getBlock(1))[0];
				this.instructions.push(instruction);
			}
		}
		//endregion
	}
	//**********************************************************************************
	encode(stream)
	{
		super.encode(stream);

		//region Store information about components
		for(let i = 0; i < this.components.length; i++)
		{
			const component = this.components[i];

			//region Set correct "flags" value
			let flags = component.flags;

			if((typeof component.matchingPoint1 !== "undefined") || (typeof component.matchingPoint2 !== "undefined"))
			{
				flags &= ~CompoundGlyphFlags.ARGS_ARE_XY_VALUES;

				if((component.matchingPoint1 > 255) ||
					(component.matchingPoint1 < 0) ||
					(component.matchingPoint2 > 255) ||
					(component.matchingPoint2 < 0))
					flags |= CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS;
				else
					flags &= ~CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS;
			}
			else
			{
				flags |= CompoundGlyphFlags.ARGS_ARE_XY_VALUES;

				if((component.matrix.e > 255) ||
					(component.matrix.e < 0) ||
					(component.matrix.f > 255) ||
					(component.matrix.f < 0))
					flags |= CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS;
				else
				{
					flags &= ~CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS;
				}
			}

			if(component.matrix.b || component.matrix.c)
				flags |= CompoundGlyphFlags.WE_HAVE_A_TWO_BY_TWO;
			else
			{
				if((component.matrix.a !== 1) || (component.matrix.d !== 1))
				{
					if(component.matrix.a !== component.matrix.d)
						flags |= CompoundGlyphFlags.WE_HAVE_AN_X_AND_Y_SCALE;
					else
						flags |= CompoundGlyphFlags.WE_HAVE_A_SCALE;
				}
			}

			if(i < (this.components.length - 1))
				flags |= CompoundGlyphFlags.MORE_COMPONENTS;
			//endregion

			//region Store informatin about flags and glyph index first
			stream.appendUint16(flags);
			stream.appendUint16(component.glyphIndex);
			//endregion

			//region Store translation coordinates
			switch(true)
			{
				case (checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
					stream.appendInt16(component.matrix.e);
					stream.appendInt16(component.matrix.f);

					break;
				case (!checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
					stream.appendView(new Uint8Array([component.matrix.e]));
					stream.appendView(new Uint8Array([component.matrix.f]));

					break;
				case (checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
					stream.appendInt16(component.matchingPoint1);
					stream.appendInt16(component.matchingPoint2);

					break;
				case (!checkFlag(flags, CompoundGlyphFlags.ARG_1_AND_2_ARE_WORDS) && !checkFlag(flags, CompoundGlyphFlags.ARGS_ARE_XY_VALUES)):
					stream.appendView(new Uint8Array([component.matchingPoint1]));
					stream.appendView(new Uint8Array([component.matchingPoint2]));

					break;
			}
			//endregion

			//region Store scaling and rotation details
			switch(true)
			{
				case checkFlag(flags, CompoundGlyphFlags.WE_HAVE_A_SCALE):
					appendF2Dot14(component.matrix.a, stream);

					break;
				case checkFlag(flags, CompoundGlyphFlags.WE_HAVE_AN_X_AND_Y_SCALE):
					appendF2Dot14(component.matrix.a, stream);
					appendF2Dot14(component.matrix.d, stream);

					break;
				case checkFlag(flags, CompoundGlyphFlags.WE_HAVE_A_TWO_BY_TWO):
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
		stream.appendUint16(this.instructions.length);

		if(this.instructions.length)
			stream.appendView(new Uint8Array(this.instructions));
		//endregion
	}
	//**********************************************************************************
	get components()
	{
		if("_components" in this === false)
			this.decode();

		return this._components;
	}
	//**********************************************************************************
	set components(value)
	{
		this._components = value;
	}
	//**********************************************************************************
	get instructions()
	{
		if("_instructions" in this === false)
			this.decode();

		return this._instructions;
	}
	//**********************************************************************************
	set instructions(value)
	{
		this._instructions = value;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Return a simplified version of "missingGlyph" from "TimesNewRoman" font
 *
 * @return {SimpleGlyph}
 */
export function missingGlyph()
{
	const missingGlyph = new SimpleGlyph({
		numberOfContours: 2,
		instructions: [],
		xMin: 284,
		yMin: 0,
		xMax: 1308,
		yMax: 1280,
		endPtsOfContours: [3, 7],
		flags: [97, 17, 33, 17, 101, 33, 17, 33],
		xCoordinates: [284, 284, 1308, 1308, 316, 1276, 1276, 316],
		yCoordinates: [0, 1280, 1280, 0, 32, 32, 1248, 1248]
	});

	missingGlyph.hAdvanceWidth = 1593;
	missingGlyph.leftSideBearing = 284;
	missingGlyph.unicodes = [65535];

	return missingGlyph;
}
//**************************************************************************************
export function nullGlyph()
{
	const nullGlyph = new SimpleGlyph({
		numberOfContours: 0,
		instructions: [],
		xMin: 0,
		yMin: 0,
		xMax: 0,
		yMax: 0,
		endPtsOfContours: [],
		flags: [],
		xCoordinates: [],
		yCoordinates: []
	});

	nullGlyph.hAdvanceWidth = 0;
	nullGlyph.leftSideBearing = 0;
	nullGlyph.unicodes = [65535];

	return nullGlyph;
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

			//region Encode individual glyph
			glyph.encode(stream);
			//endregion

			//region Put alignment bytes
			const alignmentDifference = 4 - (stream.length % 4);
			if(alignmentDifference)
			{
				const alignmentBuffer = new ArrayBuffer(alignmentDifference);
				stream.appendView(new Uint8Array(alignmentBuffer));
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

		return new GLYF({ glyphs: Array.from(streams, element => Glyph.new(element)) });
	}
	//**********************************************************************************
}
//**************************************************************************************
