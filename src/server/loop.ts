import * as http from 'http';
import {createDumpObservable} from './dumpsys';
import {server} from 'websocket';
import {parseRaw, parseSummary} from './parse';
import {EMPTY, Observable, of} from 'rxjs';
import {flatMap, share, take} from 'rxjs/operators';
import {DumpRow} from '@/shared/SharedTypes';
// @ts-ignore
import opn from 'opn';
import {RawKind, SummaryKind} from './memkinds';
import {Server} from 'http';
import * as path from 'path';
// @ts-ignore
import serveStatic from 'serve-static';
import finalhandler from 'finalhandler';
import {getParamFromFile} from './FileDump';
import * as fs from 'fs';

const wsport = 3000;

export interface Options {
    dumpJson: string | undefined,
    justServer: boolean,
    raw: boolean,
    dev: boolean,
    file: string | undefined,
}

export default function bootstrap(processName: string, options: Options) {
    const payloadsObservable = createDumpObservable(processName).pipe(
        flatMap((raw) => {
            const parsed = options.raw && parseRaw(raw) || parseSummary(raw);
            if (parsed == null) {
                return EMPTY
            }
            return of(parsed)
        }),
        share(),
    );
    const dumpJson = options.dumpJson;

    if (dumpJson) {
        const jsonArray: DumpRow[] = [];
        process.on('SIGINT', () => {
            fs.writeFileSync(dumpJson, JSON.stringify(jsonArray), 'utf8');
            process.exit()
        });
        payloadsObservable.subscribe((dump) => jsonArray.push(dump))
    }
    startServer(payloadsObservable, options)
}

function startServer(parsedObservable: Observable<DumpRow>, options: Options) {
    if (options.dev) {
        setupWs(parsedObservable, options)
        return
    }

    const dist = path.join(__dirname, '../dist');
    console.log(dist)
    const serve = serveStatic(dist);
    const httpServer = http.createServer((request, response) => {
        serve(request, response, finalhandler(request, response))
    });
    setupWs(parsedObservable, options, httpServer)
}

function setupWs(parsedObservable: Observable<DumpRow>, options: Options, httpServer?: Server) {
    httpServer = httpServer || http.createServer();
    const wsServer = new server({httpServer});

    httpServer.listen(wsport, () => {
        if (!options.justServer) {
            const address = options.dev && 'http://localhost:8080' || 'http://localhost:3000';
            if (options.file) {
                getParamFromFile(options.file).then((baseString: string) => {
                    opn(address + '?dump=' + baseString)
                })
            } else {
                opn(address);
            }
        }
    });
    console.log('waiting for connection');

    wsServer.on('request', (request) => {
        console.log('Connected');
        const conn = request.accept(undefined, request.origin)
        const schema = options.raw ? Object.values(RawKind) : Object.values(SummaryKind);
        conn.sendUTF(JSON.stringify({schema}));

        const disposable = parsedObservable.subscribe((parsed) => {
            const payload = {dumpRow: parsed};
            conn.sendUTF(JSON.stringify(payload))
        });

        wsServer.on('close', () => {
            console.log('Closed Connection');
            disposable.unsubscribe()
        })
    });
}
