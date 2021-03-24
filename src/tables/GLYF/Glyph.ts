import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../../BaseClass";

export interface GlyphParameters {
	stream?: SeqStream;
	numberOfContours?: number;
	xMin?: number;
	yMin?: number;
	xMax?: number;
	yMax?: number;
}

export class Glyph extends BaseClass {

	public stream: SeqStream;

	public unicodes?: number[];

	// TODO Filled from Font
	public index?: number;
	public hAdvanceWidth?: number;
	public leftSideBearing?: number;

	private _numberOfContours?: number;
	private _xMin?: number;
	private _yMin?: number;
	private _xMax?: number;
	private _yMax?: number;


	constructor(parameters: GlyphParameters = {}) {
		super();

		this.stream = parameters.stream || new SeqStream();

		if (parameters.numberOfContours !== undefined) {
			this.numberOfContours = parameters.numberOfContours;
		}
		if (parameters.xMin !== undefined) {
			this.xMin = parameters.xMin;
		}
		if (parameters.yMin !== undefined) {
			this.yMin = parameters.yMin;
		}
		if (parameters.xMax !== undefined) {
			this.xMax = parameters.xMax;
		}
		if (parameters.yMax !== undefined) {
			this.yMax = parameters.yMax;
		}
	}

	public static get className() {
		return "Glyph";
	}

	public decode(): void {
		this.numberOfContours = this.stream.getInt16();
		this.xMin = this.stream.getInt16();
		this.yMin = this.stream.getInt16();
		this.xMax = this.stream.getInt16();
		this.yMax = this.stream.getInt16();
	}

	public encode(stream: SeqStream) {
		stream.appendInt16(this.numberOfContours);
		stream.appendInt16(this.xMin);
		stream.appendInt16(this.yMin);
		stream.appendInt16(this.xMax);
		stream.appendInt16(this.yMax);
	}

	public get numberOfContours(): number {
		if (this._numberOfContours === undefined) {
			this.decode();
		}

		return this._numberOfContours || 0;
	}

	public set numberOfContours(value: number) {
		this._numberOfContours = value;
	}

	public get xMin(): number {
		if (this._xMin === undefined) {
			this.decode();
		}

		return this._xMin || 0;
	}

	public set xMin(value: number) {
		this._xMin = value;
	}

	public get yMin(): number {
		if (this._yMin === undefined) {
			this.decode();
		}

		return this._yMin || 0;
	}

	public set yMin(value: number) {
		this._yMin = value;
	}

	public get xMax(): number {
		if (this._xMax === undefined) {
			this.decode();
		}

		return this._xMax || 0;
	}

	public set xMax(value: number) {
		this._xMax = value;
	}

	public get yMax(): number {
		if (this._yMax === undefined) {
			this.decode();
		}

		return this._yMax || 0;
	}

	public set yMax(value: number) {
		this._yMax = value;
	}

}
