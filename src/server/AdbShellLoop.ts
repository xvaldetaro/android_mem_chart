import {spawn} from 'child_process';
import {EMPTY, interval, Observable, of, OperatorFunction} from 'rxjs';
import {parseRaw, parseSummary} from './parse';
import {switchMap} from 'rxjs/operators';
import {DumpRow} from './SharedTypes';

export class AdbShellLoop {
    private readonly isRaw: boolean;
    private readonly processName: string;
    private interval: number;

    constructor(processName: string, isRaw: boolean, intervalS?: number) {
        this.isRaw = isRaw;
        this.processName = processName;
        this.interval = (intervalS !== undefined && intervalS !== null) && intervalS * 1000 || 2000;
    }

    public getSingleDump(): Observable<DumpRow> {
        return pullDumpOrEmpty(this.processName)().pipe(parseOrEmpty(this.isRaw));
    }

    public getPeriodicDump(): Observable<DumpRow> {
        return interval(this.interval).pipe(switchMap(pullDumpOrEmpty(this.processName)), parseOrEmpty(this.isRaw));
    }
}

const pullDumpOrEmpty = (processName: string) => () => {
    return new Observable<string>((subscriber) => {
        const ls = spawn('adb', ['shell', 'dumpsys', 'meminfo', processName]);
        ls.stdout.setEncoding('utf8')

        let data = '';
        ls.stdout.on('data', (d) => {
            data = d
        });

        ls.stderr.on('data', (error) => {
            console.log(`stderr: ${error}`);
            subscriber.complete();
        });

        ls.on('close', (code) => {
            subscriber.next(data);
            subscriber.complete();
        });
    })
};

const parseOrEmpty = (isRaw: boolean): OperatorFunction<string, DumpRow> => switchMap((data: string) => {
    const parsed = isRaw && parseRaw(data) || parseSummary(data);
    if (parsed == null) {
        return EMPTY
    }
    return of(parsed)
});
