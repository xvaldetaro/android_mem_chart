import {DumpDocument, isDocument, isTaggedRow, Payload, TaggedRow} from '@/server/SharedTypes';

export class ServerStream {
    public isConnected: boolean = false;
    private listener: ((row: TaggedRow) => void) | null = null;

    public setDumpListener(listener: (row: TaggedRow) => void) {
        this.listener = listener;
    }

    public connect(onDocument: (doc: DumpDocument) => void) {
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
            const parsed = parse(message.data);
            if (parsed != null) {
                if (isDocument(parsed)) {
                    onDocument(parsed)
                } else if (this.listener && isTaggedRow(parsed)) {
                    this.listener(parsed)
                }
            }
        };
    }

}

function parse(data: string): Payload | null {
    try {
        return JSON.parse(data) as Payload;
    } catch (e) {
        console.log('This doesn\'t look like a valid JSON: ', data);
        return null;
    }

}
