export class MagicByteLengthParser extends Transform {
    constructor({ magicByte, ...args }: {
        [x: string]: any;
        magicByte: any;
    });
    delimiter: any;
    buffer: Buffer;
    _transform(chunk: any, encoding: any, cb: any): void;
    _flush(cb: any): void;
}
import { Transform } from 'node:stream';
