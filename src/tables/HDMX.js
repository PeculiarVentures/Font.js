import { BaseClass } from "../BaseClass.js";
//**************************************************************************************
export class HDMX extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.version = parameters.version || 0;
		this.records = parameters.records || [];
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x68646D78;
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 * @param {!SeqStream} stream
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
		if(this.version !== 0)
			throw new Error(`Incorrect version for 'hdmx' table: ${this.version}`);

		stream.appendUint16(this.version);
		stream.appendUint16(this.records.length);

		//region Set correct "sizeDeviceRecord" aligned to long
		let sizeDeviceRecordControl = (this.records[0].widths.length + 2);
		let sizeDeviceRecordPadding = [];

		if(sizeDeviceRecordControl % 4)
			sizeDeviceRecordPadding = new Array(4 - (sizeDeviceRecordControl % 4));
		//endregion

		if(this.records.length)
			stream.appendInt32(this.records[0].widths.length + 2 + sizeDeviceRecordPadding.length);
		else
			stream.appendInt32(0);

		for(const record of this.records)
		{
			stream.appendView(new Uint8Array([record.pixelSize, record.maxWidth, ...record.widths]));
			stream.appendView(new Uint8Array(sizeDeviceRecordPadding));
		}

		return true;
	}
	//**********************************************************************************
	/**
	 * Convert SeqStream data to object
	 *
	 * @param {!number} numGlyphs Value from "maxp" table
	 * @param {!SeqStream} stream
	 *
	 * @returns {*} Result of the function
	 */
	static fromStream(numGlyphs, stream)
	{
		const parameters = {};

		parameters.version = stream.getInt16();

		const numRecords = stream.getInt16();
		const sizeDeviceRecord = stream.getInt32();

		let sizeDeviceRecordControl = (numGlyphs + 2);
		let sizeDeviceRecordPadding = 0;

		if(sizeDeviceRecordControl % 4)
			sizeDeviceRecordPadding = 4 - (sizeDeviceRecordControl % 4);

		if(sizeDeviceRecord !== (sizeDeviceRecordControl + sizeDeviceRecordPadding))
			throw new Error(`Incorrect sizeDeviceRecord: ${sizeDeviceRecord}`);

		if(stream.length !== (numRecords * sizeDeviceRecord))
			throw new Error("Not enough space for (numRecords * sizeDeviceRecord)");

		if(parameters.version === 0)
		{
			parameters.records = [];

			for(let i = 0; i < numRecords; i++)
			{
				const record = {};

				record.pixelSize = (stream.getBlock(1))[0];
				record.maxWidth = (stream.getBlock(1))[0];
				record.widths = stream.getBlock(numGlyphs);

				stream.getBlock(sizeDeviceRecordPadding);

				parameters.records.push(record);
			}
		}
		else
			throw new Error(`Incorrect version for 'hdmx' table: ${parameters.version}`);

		return new HDMX(parameters);
	}
	//**********************************************************************************
}
//**************************************************************************************
