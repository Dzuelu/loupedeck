export class LoupedeckDevice extends EventEmitter<any> {
    static list({ ignoreSerial, ignoreWebsocket }?: {
        ignoreSerial?: boolean;
        ignoreWebsocket?: boolean;
    }): Promise<any[]>;
    constructor({ host, path, autoConnect, reconnectInterval }?: {
        autoConnect?: boolean;
        reconnectInterval?: number;
    });
    keySize: number;
    transactionID: number;
    touches: {};
    handlers: {
        [x: number]: any;
    };
    pendingTransactions: {};
    reconnectInterval: number;
    host: any;
    path: any;
    close(): any;
    connect(): Promise<any>;
    connection: any;
    _connectBlind(): Promise<any>;
    drawBuffer({ id, width, height, x, y, autoRefresh }: {
        id: any;
        width: any;
        height: any;
        x?: number;
        y?: number;
        autoRefresh?: boolean;
    }, buffer: any): Promise<void>;
    drawCanvas({ id, width, height, ...args }: {
        [x: string]: any;
        id: any;
        width: any;
        height: any;
    }, cb: any): Promise<void>;
    drawKey(index: any, cb: any): Promise<void>;
    drawScreen(id: any, cb: any): Promise<void>;
    getInfo(): Promise<{
        serial: any;
        version: any;
    }>;
    onButton(buff: any): void;
    onConnect(info: any): void;
    onDisconnect(error: any): any;
    _reconnectTimer: NodeJS.Timeout;
    onReceive(buff: any): any;
    onRotate(buff: any): void;
    onTouch(event: any, buff: any): void;
    refresh(id: any): Promise<any>;
    send(command: any, data?: Buffer): Promise<any>;
    setBrightness(value: any): Promise<any>;
    setButtonColor({ id, color }: {
        id: any;
        color: any;
    }): Promise<any>;
    vibrate(pattern?: number): Promise<any>;
}
export class LoupedeckLive extends LoupedeckDevice {
    static productId: number;
    static vendorId: number;
    buttons: number[];
    knobs: string[];
    columns: number;
    displays: {
        center: {
            id: Buffer;
            width: number;
            height: number;
            offset: number[];
        };
        left: {
            id: Buffer;
            width: number;
            height: number;
        };
        right: {
            id: Buffer;
            width: number;
            height: number;
            offset: number[];
        };
    };
    rows: number;
    type: string;
    visibleX: number[];
    getTarget(x: any, y: any): {
        screen: string;
        key?: undefined;
    } | {
        screen: string;
        key: number;
    };
}
export class LoupedeckCT extends LoupedeckLive {
    buttons: (string | number)[];
    displays: {
        center: {
            id: Buffer;
            width: number;
            height: number;
        };
        left: {
            id: Buffer;
            width: number;
            height: number;
        };
        right: {
            id: Buffer;
            width: number;
            height: number;
        };
        knob: {
            id: Buffer;
            width: number;
            height: number;
            endianness: string;
        };
    };
    getTarget(x: any, y: any, id: any): {
        screen: string;
        key?: undefined;
    } | {
        screen: string;
        key: number;
    };
}
export class LoupedeckLiveS extends LoupedeckDevice {
    static productId: number;
    static vendorId: number;
    buttons: number[];
    knobs: string[];
    columns: number;
    displays: {
        center: {
            id: Buffer;
            width: number;
            height: number;
        };
    };
    rows: number;
    type: string;
    visibleX: number[];
    getTarget(x: any, y: any): {
        screen?: undefined;
        key?: undefined;
    } | {
        screen: string;
        key: number;
    };
}
export class RazerStreamController extends LoupedeckLive {
}
export class RazerStreamControllerX extends LoupedeckDevice {
    static productId: number;
    static vendorId: number;
    type: string;
    buttons: any[];
    columns: number;
    displays: {
        center: {
            id: Buffer;
            width: number;
            height: number;
        };
    };
    rows: number;
    visibleX: number[];
    setButtonColor(): void;
    vibrate(): void;
}
import { Emitter as EventEmitter } from 'strict-event-emitter';
