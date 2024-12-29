export default class LoupedeckWSConnection extends EventEmitter<any> {
    static discover(): {
        connectionType: typeof LoupedeckWSConnection;
        productId: number;
        host: string;
    }[];
    constructor({ host }?: {});
    host: any;
    lastTick: number;
    connectionTimeout: number;
    checkConnected(): void;
    _keepAliveTimer: NodeJS.Timeout;
    close(): Promise<any>;
    connect(): Promise<any>;
    address: string;
    connection: any;
    _connectionResolver: (value: any) => void;
    isReady(): boolean;
    onConnect(): void;
    onDisconnect(errCode: any): void;
    onReceive(buff: any): void;
    send(buff: any): void;
}
import { Emitter as EventEmitter } from 'strict-event-emitter';
