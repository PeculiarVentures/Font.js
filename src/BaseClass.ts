/* eslint-disable @typescript-eslint/no-unused-vars */
import { SeqStream } from "bytestreamjs";

export class BaseClass {

	public static get className() {
		return "BaseClass";
	}

	/**
	 * Convert current object to SeqStream data
	 * @param stream
	 * @param args Custom arguments for extending
	 * @returns Result of the function
	 */
	public toStream(stream: SeqStream, ...args: any[]): boolean {
		return true;
	}

	/**
	 * Convert SeqStream data to object
	 * @param stream
	 * @param args Custom arguments for extending
	 * @returns Result of the function
	 */
	public static fromStream(stream: SeqStream, ...args: any[]): BaseClass {
		return new BaseClass();
	}

}

