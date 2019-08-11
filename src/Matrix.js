//**************************************************************************************
const zero = 0;
const one = 1;
//**************************************************************************************
export class Matrix
{
	//**********************************************************************************
	/**
	 * Constructor for the Matrix class.
	 * @param {Object} [parameters = {}]
	 * @param {number} parameters.a Number value for A index
	 * @param {number} parameters.b Number value for B index
	 * @param {number} parameters.c Number value for C index
	 * @param {number} parameters.d Number value for D index
	 * @param {number} parameters.e Number value for E index
	 * @param {number} parameters.f Number value for F index
	 * @param {number} parameters.j Number value for J index (always 0 for 2-D)
	 * @param {number} parameters.k Number value for K index (always 0 for 2-D)
	 * @param {number} parameters.l Number value for L index (always 1 for 2-D)
	 */
	constructor(parameters = {})
	{
		// Set the matrix to be "identity" by default
		this._array = [
			one  /*a*/                   , zero /*b*/                   , zero /*j (always 0 for 2-D)*/,
			zero /*c*/                   , one  /*d*/                   , zero /*k (always 0 for 2-D)*/,
			zero /*e (or X translation)*/, zero /*f (or Y translation)*/, one  /*l (always 1 for 2-D)*/
		];

		this.setValues(parameters);
	}
	//**********************************************************************************
	/**
	 * Make a PDF Matrix instance having only "translation indexes"
	 * @param {number} tx Translation index for X
	 * @param {number} ty Translation index for Y
	 * @return {Matrix}
	 */
	static makeTranslation(tx, ty)
	{
		return new Matrix({
			e: tx,
			f: ty
		});
	}
	//**********************************************************************************
	/**
	 * Set internal values of the class.
	 * @param {Object} [parameters = {}]
	 * @param {number} parameters.a Number value for A index
	 * @param {number} parameters.b Number value for B index
	 * @param {number} parameters.c Number value for C index
	 * @param {number} parameters.d Number value for D index
	 * @param {number} parameters.e Number value for E index
	 * @param {number} parameters.f Number value for F index
	 * @param {number} parameters.j Number value for J index (always 0 for 2-D)
	 * @param {number} parameters.k Number value for K index (always 0 for 2-D)
	 * @param {number} parameters.l Number value for L index (always 1 for 2-D)
	 */
	setValues(parameters = {})
	{
		this.a = parameters.a || one;
		this.b = parameters.b || zero;
		this.c = parameters.c || zero;
		this.d = parameters.d || one;
		this.e = parameters.e || zero;
		this.f = parameters.f || zero;

		// Dangerous part
		this.j = parameters.j || zero;
		this.k = parameters.k || zero;
		this.l = parameters.l || one;
	}
	//**********************************************************************************
	/**
	 * Provides multiplification with input Matrix
	 * @param {Matrix} other The matrix with need to multiply with
	 * @return {Matrix}
	 */
	multiply(other)
	{
		return new Matrix({
			a: ((this.a.value * other.a.value) + (this.b.value * other.c.value) + (this.j.value * other.e.value)),
			b: ((this.a.value * other.b.value) + (this.b.value * other.d.value) + (this.j.value * other.f.value)),
			j: ((this.a.value * other.j.value) + (this.b.value * other.k.value) + (this.j.value * other.l.value)),
			c: ((this.c.value * other.a.value) + (this.d.value * other.c.value) + (this.k.value * other.e.value)),
			d: ((this.c.value * other.b.value) + (this.d.value * other.d.value) + (this.k.value * other.f.value)),
			k: ((this.c.value * other.j.value) + (this.d.value * other.k.value) + (this.k.value * other.l.value)),
			e: ((this.e.value * other.a.value) + (this.f.value * other.c.value) + (this.l.value * other.e.value)),
			f: ((this.e.value * other.b.value) + (this.f.value * other.d.value) + (this.l.value * other.f.value)),
			l: ((this.e.value * other.j.value) + (this.f.value * other.k.value) + (this.l.value * other.l.value))
		});
	}
	//**********************************************************************************
	/**
	 * Add one matrix to another.
	 * @param {Matrix} other The matrix with need to add to
	 * @return {Matrix}
	 */
	add(other)
	{
		return new Matrix({
			a: (this.a.value + other.a.value),
			b: (this.b.value + other.b.value),
			c: (this.c.value + other.c.value),
			d: (this.d.value + other.d.value),
			e: (this.e.value + other.e.value),
			f: (this.f.value + other.f.value),
			j: (this.j.value + other.j.value),
			k: (this.k.value + other.k.value),
			l: (this.l.value + other.l.value)
		});
	}
	//**********************************************************************************
	/**
	 * Substruct one matrix from another.
	 * @param {Matrix} other The matrix we need to substruct
	 * @return {Matrix}
	 */
	sub(other)
	{
		return new Matrix({
			a: (this.a.value - other.a.value),
			b: (this.b.value - other.b.value),
			c: (this.c.value - other.c.value),
			d: (this.d.value - other.d.value),
			e: (this.e.value - other.e.value),
			f: (this.f.value - other.f.value),
			j: (this.j.value - other.j.value),
			k: (this.k.value - other.k.value),
			l: (this.l.value - other.l.value),
		});
	}
	//**********************************************************************************
	/**
	 * @return {number} Determinate for the matrix
	 */
	get det()
	{
		return (
			(this.a.value * this.d.value * this.l.value) -
			(this.a.value * this.k.value * this.f.value) -
			(this.b.value * this.c.value * this.l.value) +
			(this.b.value * this.k.value * this.e.value) +
			(this.j.value * this.c.value * this.f.value) -
			(this.j.value * this.d.value * this.e.value)
		);
	}
	//**********************************************************************************
	/**
	 * @return {number}
	 */
	get a()
	{
		return this._array[0];
	}
	//**********************************************************************************
	/**
	 * @param {number} value
	 */
	set a(value)
	{
		this._array[0] = value;
	}
	//**********************************************************************************
	/**
	 * @return {number}
	 */
	get b()
	{
		return this._array[1];
	}
	//**********************************************************************************
	/**
	 * @param {number} value
	 */
	set b(value)
	{
		this._array[1] = value;
	}
	//**********************************************************************************
	/**
	 * @return {number}
	 */
	get c()
	{
		return this._array[3];
	}
	//**********************************************************************************
	/**
	 * @param {number} value
	 */
	set c(value)
	{
		this._array[3] = value;
	}
	//**********************************************************************************
	/**
	 * @return {number}
	 */
	get d()
	{
		return this._array[4];
	}
	//**********************************************************************************
	/**
	 * @param {number} value
	 */
	set d(value)
	{
		this._array[4] = value;
	}
	//**********************************************************************************
	/**
	 * @return {number}
	 */
	get e()
	{
		return this._array[6];
	}
	//**********************************************************************************
	/**
	 * @param {number} value
	 */
	set e(value)
	{
		this._array[6] = value;
	}
	//**********************************************************************************
	/**
	 * @return {number}
	 */
	get f()
	{
		return this._array[7];
	}
	//**********************************************************************************
	/**
	 * @param {number} value
	 */
	set f(value)
	{
		this._array[7] = value;
	}
	//**********************************************************************************
	/**
	 * @return {number}
	 */
	get j()
	{
		return this._array[2];
	}
	//**********************************************************************************
	/**
	 * @param {number} value
	 */
	set j(value)
	{
		//throw new Error("Cannot set a value for PDF matrix index J");
		this._array[2] = value
	}
	//**********************************************************************************
	/**
	 * @return {number}
	 */
	get k()
	{
		return this._array[5];
	}
	//**********************************************************************************
	/**
	 * @param {number} value
	 */
	set k(value)
	{
		//throw new Error("Cannot set a value for PDF matrix index K");
		this._array[5] = value;
	}
	//**********************************************************************************
	/**
	 * @return {number}
	 */
	get l()
	{
		return this._array[8];
	}
	//**********************************************************************************
	/**
	 * @param {number} value
	 */
	set l(value)
	{
		//throw new Error("Cannot set a value for PDF matrix index L");
		this._array[8] = value;
	}
	//**********************************************************************************
}
//**************************************************************************************
