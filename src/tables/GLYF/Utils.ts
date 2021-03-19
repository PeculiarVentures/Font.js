import { SimpleGlyph } from "./SimpleGlyph";

/**
 * Return a simplified version of "missingGlyph" from "TimesNewRoman" font
 *
 * @return {SimpleGlyph}
 */


export function missingGlyph(): SimpleGlyph {
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

export function nullGlyph(): SimpleGlyph {
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
