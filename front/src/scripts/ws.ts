import EventEmitter from "eventemitter3";

export class Ws extends EventEmitter {
    uri: string;

    ws?: WebSocket | null;
    id?: number
    passcode?: number

    fails: number = 0;
    timeout?: number;

    updates: Map<string, ArrayBuffer>; // todo: on reconnect, send updates

    constructor(uri: string) {
        super();

        this.uri = uri;

        this.updates = new Map();
    }

    start() {
        this.ws = new WebSocket(this.uri);

        this.ws.binaryType = "arraybuffer";

        this.ws.onopen = () => {
            this.fails = 0;
        
            console.log("open");

            if (this.id !== undefined) {
                this.ws!.send(new Uint32Array([this.id!, this.passcode!]));
            } else {
                this.ws!.send(new Uint32Array([0]));
            }
        };

        this.ws.onmessage = (event) => {
            console.log(new Uint8Array(event.data));

            if (typeof event.data == "string") return;

            const buffer: ArrayBuffer = event.data;

            if (buffer.byteLength == 0) {
                this.ws!.send(new ArrayBuffer(0));

                return;
            }

            if (this.id === undefined) {
                [this.id, this.passcode] = Array.from(new Uint32Array(buffer));

                return;
            }

            const dv = new DataView(buffer);

            const sender = dv.getInt32(0);

            if (sender == 0) {
                ;
            } else {
                ;
            }
        };

        this.ws.onclose = (event) => {
            console.log("close", event.code, event.reason);

            this.timeout = window.setTimeout(this.start.bind(this), Math.min((this.fails + 1) * 200, 2000));
        };
    }

    send(buffer: ArrayBuffer) {
        if (this.ws && this.ws.readyState == WebSocket.OPEN) {
            this.ws.send(buffer);
        } else {
            //this.queue.push(buffer);
        }
    }

    update(type: string, buffer: ArrayBuffer) {
        if (this.ws && this.ws.readyState == WebSocket.OPEN) {
            this.ws.send(buffer);
        } else {
            this.updates.set(type, buffer);
        }
    }

    log_in() {

    }
}