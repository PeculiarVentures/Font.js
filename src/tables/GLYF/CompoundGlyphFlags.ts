
export enum CompoundGlyphFlags {

	/**
	 * If set, the arguments are words; If not set, they are bytes
	 */
	ARG_1_AND_2_ARE_WORDS = 0x0001,




	/**
	 * If set, the arguments are xy values; If not set, they are points
	 */
	ARGS_ARE_XY_VALUES = 0x0002,





	/**
	 * If set, round the xy values to grid; if not set do not round xy values to grid
	 * (relevant only to bit 1 is set)
	 */
	ROUND_XY_TO_GRID = 0x0004,




	/**
	 * If set, there is a simple scale for the component; If not set, scale is 1.0
	 */
	WE_HAVE_A_SCALE = 0x0008,




	/**
	 * If set, at least one additional glyph follows this one
	 */
	MORE_COMPONENTS = 0x0020,




	/**
	 * If set the x direction will use a different scale than the y direction
	 */
	WE_HAVE_AN_X_AND_Y_SCALE = 0x0040,




	/**
	 * If set there is a 2-by-2 transformation that will be used to scale the component
	 */
	WE_HAVE_A_TWO_BY_TWO = 0x0080,




	/**
	 * If set, instructions for the component character follow the last component
	 */
	WE_HAVE_INSTRUCTIONS = 0x0100,




	/**
	 * Use metrics from this component for the compound glyph
	 */
	USE_MY_METRICS = 0x0200,




	/**
	 * If set, the components of this compound glyph overlap
	 */
	OVERLAP_COMPOUND = 0x0400,




	/**
	 * Bit 11: The composite is designed to have the component offset scaled
	 */
	SCALED_COMPONENT_OFFSET = 0x0800,




	/**
	 * Bit 12: The composite is designed not to have the component offset scaled
	 */
	UNSCALED_COMPONENT_OFFSET = 0x1000
}
