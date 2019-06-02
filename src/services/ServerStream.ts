import {DumpRow, Payload} from '@/server/SharedTypes';

export class ServerStream {
    public isConnected: boolean = false;
    private listener: ((dump: DumpRow) => void) | null = null;

    public setDumpListener(listener: (dump: DumpRow) => void) {
        this.listener = listener;
    }

    public connect(onSchema: (schema: string[]) => void) {
        const connection = new WebSocket('ws://127.0.0.1:3000');

        connection.onopen = () => { this.isConnected = true; };

        connection.onclose = (error) => {
            this.isConnected = false;
        };

        connection.onerror = (error) => {
            this.isConnected = false;
            console.log('Connection error')
        };

        connection.onmessage = (message) => {
            console.log('onMessage: ' + message);
            const parsed = this.parse(message.data);
            if (parsed != null) {
                if (parsed.schema) {
                    onSchema(parsed.schema)
                } else if (parsed.dumpRow && this.listener) {
                    this.listener(parsed.dumpRow)
                }
            }
        };
    }

    private parse(data: string): Payload | null {
        try {
            return JSON.parse(data) as Payload;
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', data);
            return null;
        }

    }
}
