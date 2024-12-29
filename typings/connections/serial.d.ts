export default class LoupedeckSerialConnection extends EventEmitter<any> {
    static discover(): Promise<{
        connectionType: typeof LoupedeckSerialConnection;
        path: string;
        vendorId: number;
        productId: number;
        serialNumber: string;
    }[]>;
    constructor({ path }?: {});
    path: any;
    close(): Promise<any>;
    connect(): Promise<void>;
    connection: SerialPort<import("@serialport/bindings-cpp").AutoDetectTypes>;
    isReady(): boolean;
    onDisconnect(err: any): void;
    onError(err: any): void;
    send(buff: any, raw?: boolean): void;
}
import { Emitter as EventEmitter } from 'strict-event-emitter';
import { SerialPort } from 'serialport';
