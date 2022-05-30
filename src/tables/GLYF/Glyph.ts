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

	public numberOfContours!: number;
	public xMin!: number;
	public yMin!: number;
	public xMax!: number;
	public yMax!: number;


	constructor(parameters: GlyphParameters = {}) {
		super();

		if (parameters.stream) {
			this.stream = parameters.stream;
			this.decode();
		} else {
			this.stream = new SeqStream();
		}

		this.numberOfContours ??= parameters.numberOfContours || 0;
		this.xMin ??= parameters.xMin || 0;
		this.yMin ??= parameters.yMin || 0;
		this.xMax ??= parameters.xMax || 0;
		this.yMax ??= parameters.yMax || 0;
	}

	public static get className() {
		return "Glyph";
	}

	// TODO Change to toStream/fromStream
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

}
