import {spawn} from 'child_process';
import {interval, Observable, Subscriber} from 'rxjs';
import {share, switchMap} from 'rxjs/operators';

export function createDumpObservable(namespace: string): Observable<string> {
    return interval(1000).pipe(
        switchMap(() => {
            return new Observable<string>((subscriber) => {
                pull(subscriber, namespace)
            })
        }),
    );
}

function pull(subscriber: Subscriber<string>, namespace: string) {
    const ls = spawn('adb', ['shell', 'dumpsys', 'meminfo', namespace]);
    ls.stdout.setEncoding('utf8')

    let data = '';
    ls.stdout.on('data', (d) => {
        data = d
    });

    ls.stderr.on('data', (error) => {
        console.log(`stderr: ${error}`);
    });

    ls.on('close', (code) => {
        subscriber.next(data)
    });
}

