import * as http from 'http';
import {Server} from 'http';
import {server} from 'websocket';
import {DumpRow, Payload, Schema} from './SharedTypes';
// @ts-ignore
import opn from 'opn';
import {RawKind, SummaryKind} from './memkinds';
import * as path from 'path';
// @ts-ignore
import serveStatic from 'serve-static';
import finalhandler from 'finalhandler';
import {getParamFromFile} from './FileDump';
import {Observable} from 'rxjs';
import {RawKinds, SummaryKinds} from './parse';

const wsport = 3000;

export class ServerLoop {
    private readonly isDev: boolean;
    private readonly isRaw: boolean;
    private readonly shellObservable: Observable<DumpRow>;
    private readonly openBrowser: boolean;
    private readonly fromFile: string | undefined;

    constructor(openBrowser: boolean, isDev: boolean, isRaw: boolean, shellObservable: Observable<DumpRow>,
                fromFile?: string) {
        this.isDev = isDev;
        this.isRaw = isRaw;
        this.shellObservable = shellObservable;
        this.openBrowser = openBrowser;
        this.fromFile = fromFile;
    }

    public launch() {
        if (this.isDev) {
            this.setupWs();
            return
        }

        const dist = path.join(__dirname, '../dist');
        const serve = serveStatic(dist);
        const httpServer = http.createServer((request, response) => {
            serve(request, response, finalhandler(request, response))
        });
        this.setupWs(httpServer)
    }

    private setupWs(httpServer?: Server) {
        httpServer = httpServer || http.createServer();
        const wsServer = new server({httpServer});

        httpServer.listen(wsport, () => {
            if (this.openBrowser) {
                const address = this.isDev && 'http://localhost:8080' || 'http://localhost:3000';
                if (this.fromFile) {
                    getParamFromFile(this.fromFile).then((baseString: string) => {
                        opn(address + '?dump=' + baseString)
                    })
                } else {
                    opn(address);
                }
            }
        });

        if (this.fromFile) {
            return;
        }

        console.log('waiting for connection');

        let tag = 0;
        wsServer.on('request', (request) => {
            console.log('Connected');
            const conn = request.accept(undefined, request.origin)
            const schema: Schema = this.isRaw ? RawKinds : SummaryKinds;
            const doc = {schema, rows: []};
            conn.sendUTF(JSON.stringify(doc));

            const disposable = this.shellObservable.subscribe((parsed) => {
                const payload: Payload = {row: parsed, tag: (tag++).toString()};
                conn.sendUTF(JSON.stringify(payload))
            });

            wsServer.on('close', () => {
                console.log('Closed Connection');
                disposable.unsubscribe()
            })
        });
    }

}
