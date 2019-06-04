import {DumpRow, Schema, TaggedRow} from '@/server/SharedTypes';
import {ChartData} from '@/services/ChartConstants';
import {kindToColor} from '@/services/ChartColors';
import {Repo} from '@/store';

export function toChartData(count: number, repo: Repo, schema: Schema, excludedKinds: boolean[]): ChartData {
    const sliced = repo.rows.slice(-1 * count);
    const labels: string[] = repo.tags.slice(-1 * count);
    for (let index = labels.length; index < count; index++) {
        labels[index] = '_'
    }

    const datasets = schema.map((name, index) => {
        const data = sliced.map(row => row[index]);
        const backgroundColor = kindToColor(name, index);
        return {data, backgroundColor, name, index, hidden: excludedKinds[index]};
    });

    return {labels, datasets};
}

export function toCsv(): string {
    return '';
    // const header = 'tag,' + this.schema.join(',') + '\n';
    // const body = this.rowsMeta.map(({tag, row}) => {
    //     return tag + ',' + row.map(({value}) => value).join(',');
    // }).join('\n');
    // return header + body;
}

export function toJson(schema: Schema, repo: Repo): string {
    return JSON.stringify({
        rows: repo.rows.map((row, index) => ({row, tag: repo.tags[index]})),
        schema,
    });
}

export function clear() {
    // this.rowsMeta = [];
    // this.dumpByKind = this.schema.map(() => []);
}

export function deleteRow(repo: Repo, tag: string) {
    const index = repo.tags.findIndex(v => v === tag);
    if (index !== -1) {
        repo.tags.splice(index, 1);
        repo.rows.splice(index, 1);
        repo.diffs.splice(index, 1);
    }
}

export function pushRow(repo: Repo, {row, tag}: TaggedRow) {
    const previous = repo.rows[repo.rows.length - 1];
    repo.rows.push(row);
    repo.tags.push(tag);

    if (!previous) {
        repo.diffs.push(row.map(() => 0));
        return;
    }

    repo.diffs.push(
        row.map((value, index) => {
            const previousValue = previous[index];
            if (previousValue === 0) {
                if (value > 0) {
                    return 100;
                } else {
                    return 0;
                }
            } else {
                return (value - previousValue) / previousValue;
            }
        }),
    );
}
