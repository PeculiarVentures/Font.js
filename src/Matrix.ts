export interface MatrixParameters {
	/**
	 * value for A index
	 */
	a?: number;
	/**
	 * value for B index
	 */
	b?: number;
	/**
	 * value for C index
	 */
	c?: number;
	/**
	 * value for D index
	 */
	d?: number;
	/**
	 * value for E index
	 */
	e?: number;
	/**
	 * value for F index
	 */
	f?: number;
	/**
	 * value for J index (always 0 for 2-D)
	 */
	j?: number;
	/**
	 * value for K index (always 0 for 2-D)
	 */
	k?: number;
	/**
	 * value for L index (always 1 for 2-D)
	 */
	l?: number;
}

const zero = 0;
const one = 1;

export class Matrix {

	private _array: number[];

	/**
	 * Constructor for the Matrix class.
	 * @param parameters
	 */
	constructor(parameters: MatrixParameters = {}) {
		// Set the matrix to be "identity" by default
		this._array = [
			one  /*a*/, zero /*b*/, zero /*j (always 0 for 2-D)*/,
			zero /*c*/, one  /*d*/, zero /*k (always 0 for 2-D)*/,
			zero /*e (or X translation)*/, zero /*f (or Y translation)*/, one  /*l (always 1 for 2-D)*/
		];

		this.setValues(parameters);
	}

	/**
	 * Make a PDF Matrix instance having only "translation indexes"
	 * @param tx Translation index for X
	 * @param ty Translation index for Y
	 */
	public static makeTranslation(tx: number, ty: number): Matrix {
		return new Matrix({
			e: tx,
			f: ty
		});
	}

	/**
	 * Set internal values of the class.
	 * @param parameters
	 */
	public setValues(parameters: MatrixParameters = {}): void {
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

	/**
	 * Provides multiplication with input Matrix
	 * @param other The matrix with need to multiply with
	 */
	public multiply(other: Matrix): Matrix {
		return new Matrix({
			a: ((this.a * other.a) + (this.b * other.c) + (this.j * other.e)),
			b: ((this.a * other.b) + (this.b * other.d) + (this.j * other.f)),
			j: ((this.a * other.j) + (this.b * other.k) + (this.j * other.l)),
			c: ((this.c * other.a) + (this.d * other.c) + (this.k * other.e)),
			d: ((this.c * other.b) + (this.d * other.d) + (this.k * other.f)),
			k: ((this.c * other.j) + (this.d * other.k) + (this.k * other.l)),
			e: ((this.e * other.a) + (this.f * other.c) + (this.l * other.e)),
			f: ((this.e * other.b) + (this.f * other.d) + (this.l * other.f)),
			l: ((this.e * other.j) + (this.f * other.k) + (this.l * other.l))
		});
	}

	/**
	 * Add one matrix to another.
	 * @param other The matrix with need to add to
	 */
	public add(other: Matrix) {
		return new Matrix({
			a: (this.a + other.a),
			b: (this.b + other.b),
			c: (this.c + other.c),
			d: (this.d + other.d),
			e: (this.e + other.e),
			f: (this.f + other.f),
			j: (this.j + other.j),
			k: (this.k + other.k),
			l: (this.l + other.l)
		});
	}

	/**
	 * Substruct one matrix from another.
	 * @param other The matrix we need to substruct
	 */
	sub(other: Matrix) {
		return new Matrix({
			a: (this.a - other.a),
			b: (this.b - other.b),
			c: (this.c - other.c),
			d: (this.d - other.d),
			e: (this.e - other.e),
			f: (this.f - other.f),
			j: (this.j - other.j),
			k: (this.k - other.k),
			l: (this.l - other.l),
		});
	}

	/**
	 * @return Determinate for the matrix
	 */
	get det() {
		return (
			(this.a * this.d * this.l) -
			(this.a * this.k * this.f) -
			(this.b * this.c * this.l) +
			(this.b * this.k * this.e) +
			(this.j * this.c * this.f) -
			(this.j * this.d * this.e)
		);
	}

	public get a(): number {
		return this._array[0];
	}

	public set a(value: number) {
		this._array[0] = value;
	}

	public get b(): number {
		return this._array[1];
	}

	public set b(value: number) {
		this._array[1] = value;
	}

	get c(): number {
		return this._array[3];
	}

	set c(value: number) {
		this._array[3] = value;
	}

	get d(): number {
		return this._array[4];
	}

	set d(value: number) {
		this._array[4] = value;
	}

	public get e(): number {
		return this._array[6];
	}

	public set e(value: number) {
		this._array[6] = value;
	}

	get f(): number {
		return this._array[7];
	}

	set f(value: number) {
		this._array[7] = value;
	}

	get j(): number {
		return this._array[2];
	}

	set j(value: number) {
		this._array[2] = value;
	}

	get k(): number {
		return this._array[5];
	}

	set k(value: number) {
		this._array[5] = value;
	}

	get l(): number {
		return this._array[8];
	}

	set l(value: number) {
		this._array[8] = value;
	}

}

