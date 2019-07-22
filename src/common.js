//**************************************************************************************
export function getLongDateTime(stream)
{
	stream.getUint32(); // Consider first part to be zero in a nearest future
	const part2 = stream.getUint32();

	return new Date((part2 - 2082844800) * 1000);
}
//**************************************************************************************
export function appendLongDateTime(date, stream)
{
	stream.appendUint32(0);
	stream.appendUint32((date / 1000) + 2082844800);
}
//**************************************************************************************
/**
 * @param {SeqStream} stream
 * @return {number}
 */
export function getF2Dot14(stream)
{
	const value = stream.getInt16();
	return (value / 16384);
}
//**************************************************************************************
/**
 * @param {number} value
 * @param {SeqStream} stream
 */
export function appendF2Dot14(value, stream)
{
	// noinspection JSUnresolvedFunction
	stream.appendInt16(value * 16384);
}
//**************************************************************************************
export function checkFlag(flag, mask)
{
	return ((flag & mask) === mask);
}
//**************************************************************************************
/**
 * @param {SeqStream} stream
 */
export function getFixed(stream)
{
	const result = {};

	result.integer = stream.getInt16();
	result.fraction = stream.getUint16();
	
	return result;
}
//**************************************************************************************
export function appendFixed(value, stream)
{
	// noinspection JSUnresolvedFunction
	stream.appendInt16(value.integer);
	stream.appendUint16(value.fraction);
}
//**************************************************************************************

