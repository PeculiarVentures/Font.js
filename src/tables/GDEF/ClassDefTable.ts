import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../../BaseClass";

export interface ClassDefTableParameters {
	classFormat?: number; // TODO Not used in constructor parameter
	glyphToClass?: Map<number, number>;
	classToGlyph?: Map<number, number[]>;
}
export class ClassDefTable extends BaseClass {

	public glyphToClass: Map<number, number>;
	public classToGlyph: Map<number, number[]>;

	constructor(parameters: ClassDefTableParameters = {}) {
		super();

		this.glyphToClass = parameters.glyphToClass || new Map();
		this.classToGlyph = parameters.classToGlyph || new Map();
	}

	static fromStream(stream: SeqStream) {
		const parameters: ClassDefTableParameters = {};

		parameters.glyphToClass = new Map();
		parameters.classToGlyph = new Map();
		parameters.classFormat = stream.getUint16();

		switch (parameters.classFormat) {
			case 1:
				{
					let startGlyphID = stream.getUint16();
					const glyphCount = stream.getUint16();

					for (let i = 0; i < glyphCount; i++, startGlyphID++) {
						const classValue = stream.getUint16();

						parameters.glyphToClass.set(startGlyphID, classValue);

						let glyphs = parameters.classToGlyph.get(classValue);
						if (typeof glyphs === "undefined")
							glyphs = [];

						glyphs.push(startGlyphID);

						parameters.classToGlyph.set(classValue, glyphs);
					}
				}

				break;
			case 2:
				{
					const classRangeCount = stream.getUint16();

					for (let i = 0; i < classRangeCount; i++) {
						const startGlyphID = stream.getUint16();
						const endGlyphID = stream.getUint16();
						const glyphClass = stream.getUint16();

						for (let j = startGlyphID; j <= endGlyphID; j++) {
							parameters.glyphToClass.set(j, glyphClass);

							let glyphs = parameters.classToGlyph.get(glyphClass);
							if (!glyphs) {
								glyphs = [];
							}

							glyphs.push(j);

							parameters.classToGlyph.set(glyphClass, glyphs);
						}
					}
				}

				break;
			default:
				return new ClassDefTable({});
		}

		return new ClassDefTable(parameters);
	}

}
