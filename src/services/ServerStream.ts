import {DumpDocument, isDocument, isTaggedRow, Payload, TaggedRow} from '@/server/SharedTypes';

export class ServerStream {
    private onConnect: () => void;
    private onDocument: (doc: DumpDocument) => void;
    private onDisconnect: () => void;
    private onRow: (row: TaggedRow) => void;

    constructor(
        onConnect: () => void,
        onDocument: (doc: DumpDocument) => void,
        onRow: (row: TaggedRow) => void,
        onDisconnect: () => void,
    ) {
        console.log('New stream');
        this.onConnect = onConnect;
        this.onDocument = onDocument;
        this.onDisconnect = onDisconnect;
        this.onRow = onRow;
    }

    public connect() {
        const connection = new WebSocket('ws://127.0.0.1:3000');

        connection.onopen = () => {
            console.log('Connected');
            this.onConnect()
        };

        connection.onclose = (error) => {
            this.onDisconnect();
            console.log('Disconnect');
            setTimeout(() => this.connect(), 5000);
        };

        connection.onerror = (error) => {
            this.onDisconnect();
            console.log('Connection error')
        };

        connection.onmessage = (message) => {
            const parsed = parse(message.data);
            if (parsed != null) {
                if (isDocument(parsed)) {
                    this.onDocument(parsed)
                } else if (isTaggedRow(parsed)) {
                    this.onRow(parsed)
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
