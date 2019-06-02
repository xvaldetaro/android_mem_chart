import {Observable} from 'rxjs';
import {DumpDocument, DumpRow, Optional, TaggedRow} from './SharedTypes';
import * as fs from 'fs';
import {map, switchMap, take} from 'rxjs/operators';

export class FileSaveLoop {
    private readonly shellObservable: Observable<DumpRow>;
    private readonly file: string;
    private readonly rows: TaggedRow[] = [];
    private tag = 0;

    constructor(file: string, shellObservable: Observable<DumpRow>) {
        this.shellObservable = shellObservable;
        this.file = file;
    }

    public launch() {
        const disposable = this.record();
        process.on('SIGINT', () => {
            disposable()
        });
    }

    public takeSnapshot(tag?: string) {
        readOrCreateDocument(this.file).pipe(
            switchMap((docOpt: Optional<DumpDocument>) => {
                return this.shellObservable.pipe(
                    take(1),
                    map((row) => {
                        let doc = docOpt.get();
                        if (!doc) {
                            doc = {schema: Object.keys(row), rows: []};
                        }
                        this.addRow(row, doc, tag);
                        return doc;
                    }),
                );
            }),
        ).subscribe((doc: DumpDocument) => {
            fs.writeFileSync(this.file, JSON.stringify(doc), 'utf8');
        });
    }

    private record(): (() => void) {
        const unsubscribe = this.shellObservable.subscribe((dump) => {
            dump.tag = this.tag++;
            this.rows.push({tag: (this.tag++).toString(), row: dump});
        });
        const dispose = () => {
            const doc = {schema: Object.keys(this.rows[0]), rows: this.rows};
            fs.writeFileSync(this.file, JSON.stringify(doc), 'utf8');
            unsubscribe.unsubscribe();
        };
        return dispose;
    }

    private addRow(row: DumpRow, doc: DumpDocument, tag?: string) {
        if (!tag) {
            tag = doc.rows.length.toString();
        }
        doc.rows.push({tag: tag.toString(), row});
        return doc;
    }

    private isCsv(): boolean {
        return this.file.slice(-4) === '.csv';
    }
}

const readOrCreateDocument = (file: string) => new Observable<Optional<DumpDocument>>((subscriber) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            subscriber.next(new Optional());
            return;
        }
        try {
            const doc: DumpDocument = JSON.parse(data);
            if (!Array.isArray(doc.schema) || !Array.isArray(doc.rows)) {
                subscriber.error('Invalid document');
            }

            subscriber.next(new Optional(doc));
            subscriber.complete()
        } catch (e) {
            subscriber.error(err)
        }
    });
});

