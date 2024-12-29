export default class LoupedeckWebSerialConnection extends EventEmitter<any> {
    static discover(): Promise<{
        connectionType: typeof LoupedeckWebSerialConnection;
        port: any;
        productId: any;
        vendorId: any;
    }[]>;
    constructor({ port }?: {});
    port: any;
    close(): Promise<void>;
    connect(): Promise<void>;
    writer: any;
    aborter: AbortController;
    readStream: AsyncGenerator<any, void, unknown>;
    isReady(): any;
    onDisconnect(err: any): void;
    onError(err: any): void;
    read(): Promise<void>;
    send(buff: any, raw?: boolean): any;
}
import { Emitter as EventEmitter } from 'strict-event-emitter';
