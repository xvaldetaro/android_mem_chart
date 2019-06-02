import {DumpRow, Schema, TaggedRow} from '@/server/SharedTypes';
import {ChartData} from '@/services/ChartConstants';
import {ExcludedKinds} from '@/services/ExcludedKinds';
import {ChartColors} from '@/services/ChartColors';

export type DumpByKind = number[][]

export interface KindDumpMeta {
    diffPercent: number;
    value: number;
}

export interface DumpRowMeta {
    row: KindDumpMeta[];
    tag: string
}

export class Repository {
    public rowsMeta: DumpRowMeta[] = [];
    private dumpByKind: DumpByKind = [];
    private step: number = 0;
    private excludeKinds: ExcludedKinds;
    private schema: string[];
    private chartColors = new ChartColors();

    constructor(excludedKinds: ExcludedKinds, schema: Schema) {
        this.schema = schema;
        this.dumpByKind = schema.map(() => []);
        this.excludeKinds = excludedKinds;
    }

    public toChartData(count: number): ChartData {
        const labels: string[] = this.sliceRows(count).map((meta) => meta.tag);
        for (let index = labels.length; index < count; index++) {
            labels[index] = '_'
        }

        const datasets = this.schema
            .map((name, index) => {
                const data = this.dumpByKind[index].slice(-1 * count);
                const backgroundColor = this.chartColors.kindToColor(name, index);
                return {data, backgroundColor, name, index, hidden: this.excludeKinds.isExcluded(index)};
            });

        return {labels, datasets};
    }

    public toCsv(): string {
        const header = 'tag,' + this.schema.join(',') + '\n';
        const body = this.rowsMeta.map(({tag, row}) => {
            return tag + ',' + row.map(({value}) => value).join(',');
        }).join('\n');
        return header + body;
    }

    public toJson(): string {
        const rows: TaggedRow[] = this.rowsMeta.map((meta: DumpRowMeta) => {
            const pureValueRow = meta.row.map((withDiff) => withDiff.value);
            return {row: pureValueRow, tag: meta.tag};
        });
        return JSON.stringify({schema: this.schema, rows});
    }

    public clear() {
        this.rowsMeta = [];
        this.dumpByKind = this.schema.map(() => []);
    }

    public sliceRows(count: number): DumpRowMeta[] {
        return this.rowsMeta.slice(-1 * count);
    }

    public deleteRow(tag: string) {
        const index = this.rowsMeta.findIndex((e) => e.tag === tag)
        if (index !== -1) {
            this.rowsMeta.splice(index, 1)
            this.dumpByKind.forEach((col) => col.splice(index, 1));
        }
    }

    public pushRowMeta(meta: DumpRowMeta) {
        if (this.rowsMeta.length > 50000) {
            this.rowsMeta = this.rowsMeta.slice(-10000);
        }

        let step = meta.tag;
        this.step += 1;
        if (!step) {
            step = this.step.toString();
        }
        this.dumpByKind.forEach((col, index) => col.push(meta.row[index].value));
        const row: DumpRow = meta.row.map(({value}) => value);
        const previous = this.rowsMeta.length !== 0 && this.rowsMeta[this.rowsMeta.length - 1] || null;
        this.rowsMeta.push(this.getMeta(row, previous, step))
    }

    public pushRow({row, tag}: TaggedRow) {
        if (this.rowsMeta.length > 50000) {
            this.rowsMeta = this.rowsMeta.slice(-10000);
        }

        row.forEach((value, index) => this.dumpByKind[index].push(value));
        const previous = this.rowsMeta.length !== 0 && this.rowsMeta[this.rowsMeta.length - 1] || null;
        this.rowsMeta.push(this.getMeta(row, previous, tag))
    }

    private getMeta(row: DumpRow, previous: DumpRowMeta | null, tag: string): DumpRowMeta {
        const meta: DumpRowMeta = {row: [], tag};
        if (!previous) {
            meta.row = row.map((value) => ({diffPercent: 0, value}));
        } else {
            meta.row = row.map((value, index) => {
                const previousValue = previous.row[index].value;
                let diff = 100;
                if (previousValue === 0) {
                    if (value > 0) {
                        diff = 100;
                    } else {
                        diff = 0;
                    }
                } else {
                    diff = (value - previousValue) / previousValue;
                }
                return {diffPercent: diff, value};
            });
        }
        return meta
    }
}
