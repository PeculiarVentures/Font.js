import * as asn1js from "../../asn1js/asn1.js";
import * as pkijs from "../../pkijs/index.js";
import { SeqStream } from "bytestreamjs";
import { BaseClass } from "../BaseClass.js";
//**************************************************************************************
export class DSIG extends BaseClass
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		super();

		this.version = parameters.version || 0x00000001;
		this.numSignatures = parameters.numSignatures || 0;
		this.flags = parameters.flags || 0;
		this.signatureRecords = parameters.signatureRecords || [];
	}
	//**********************************************************************************
	static get tag()
	{
		return 0x44534947;
	}
	//**********************************************************************************
	/**
	 * Convert current object to SeqStream data
	 *
	 * @param {!SeqStream} stream
	 *
	 * @returns {boolean} Result of the function
	 */
	toStream(stream)
	{
		return true;
	}
	//**********************************************************************************
	/**
	 * Convert SeqStream data to object
	 *
	 * @param {!SeqStream} stream
	 *
	 * @returns {*} Result of the function
	 */
	static fromStream(stream)
	{
		const version = stream.getUint32();
		const numSignatures = stream.getUint16();
		const flags = stream.getUint16();
		const signatureRecords = [];

		for(let i = 0; i < numSignatures; i++)
		{
			const signatureRecord = {};

			signatureRecord.format = stream.getUint32();
			signatureRecord.length = stream.getUint32();
			signatureRecord.offset = stream.getUint32();

			const signatureBlockStream = new SeqStream({ stream: stream.stream.slice(signatureRecord.offset, signatureRecord.offset + signatureRecord.length ) });

			signatureRecord.signatureBlock = {};
			signatureRecord.signatureBlock.reserved1 = signatureBlockStream.getUint16();
			signatureRecord.signatureBlock.reserved2 = signatureBlockStream.getUint16();
			signatureRecord.signatureBlock.signatureLength = signatureBlockStream.getUint32();
			signatureRecord.signatureBlock.signature = signatureBlockStream.getBlock(signatureRecord.signatureBlock.signatureLength);

			//region Parse CMS SignedData if we can
			const asn1 = asn1js.fromBER((new Uint8Array(signatureRecord.signatureBlock.signature)).buffer);
			if(asn1.offset !== (-1))
			{
				try
				{
					const contentInfo = new pkijs.ContentInfo({ schema: asn1.result });
					signatureRecord.signatureBlock.signatureParsed = new pkijs.SignedData({ schema: contentInfo.content });
				}
				catch(ex){}
			}
			//endregion

			signatureRecords.push(signatureRecord);
		}

		return new DSIG({
			version,
			numSignatures,
			flags,
			signatureRecords
		});
	}
	//**********************************************************************************
}
//**************************************************************************************
