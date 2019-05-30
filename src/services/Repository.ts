import {DumpRow} from '@/shared/SharedTypes';
import {ChartData, kindToColor} from '@/services/ChartConstants';
import {ExcludedKinds} from '@/services/ExcludedKinds';

export interface DumpByKind {
    [key: string]: number[];
}

export interface KindDumpMeta {
    diffPercent: number;
    value: number;
}

export interface DumpRowMeta {
    kinds: { [key: string]: KindDumpMeta },
    step: string
}

export class Repository {
    public rowsMeta: DumpRowMeta[] = [];
    private dumpByKind: DumpByKind = {};
    private step: number = 0;
    private excludeKinds: ExcludedKinds;
    private schema: string[];

    constructor(excludedKinds: ExcludedKinds, schema: string[]) {
        this.schema = schema;
        this.excludeKinds = excludedKinds;
        schema.map((kind) => this.dumpByKind[kind] = []);
        this.dumpByKind.step = [];
    }

    public toChartData(count: number): ChartData {
        const labels: string[] = this.sliceRows(count).map((meta) => meta.step);
        for (let index = labels.length; index < count; index++) {
            labels[index] = '_'
        }

        const datasets = this.schema
            .map((kind) => {
                const data = this.dumpByKind[kind].slice(-1 * count);
                const backgroundColor = kindToColor(kind);
                return {data, backgroundColor, kind, hidden: this.excludeKinds.isExcluded(kind)};
            });

        return {labels, datasets};
    }

    public toCsv(): string {
        const header = 'step,' + this.schema.join(',') + '\n';
        const inverted = this.rowsMeta.slice();
        inverted.reverse();
        const body = inverted.map((meta) => {
            const values = this.schema.map((kind) => meta.kinds[kind].value);
            return meta.step + ',' + values.join(',');
        }).join('\n');
        return header + body;
    }

    public toJson(): string {
        const inverted = this.rowsMeta.slice();
        inverted.reverse();
        return JSON.stringify(inverted.map((meta) => {
            const raw: DumpRow = {};
            this.schema.map((kind) => {
                raw[kind] = meta.kinds[kind].value;
            });
            return raw;
        }))
    }

    public clear() {
        this.rowsMeta = [];
        this.dumpByKind = {};
        this.schema.map((kind) => this.dumpByKind[kind] = []);
        this.step = 0;
    }

    public sliceRows(count: number): DumpRowMeta[] {
        return this.rowsMeta.slice(-1 * count);
    }

    public deleteRow(step: string) {
        const index = this.rowsMeta.findIndex((e) => e.step === step)
        if (index !== -1) {
            this.rowsMeta.splice(index, 1)
            Object.keys(this.dumpByKind).forEach((key) => this.dumpByKind[key].splice(index, 1));
        }
    }

    public pushRowMeta(meta: DumpRowMeta) {
        if (this.rowsMeta.length > 50000) {
            this.rowsMeta = this.rowsMeta.slice(-10000);
        }

        let step = meta.step;
        this.step += 1;
        if (!step) {
            step = this.step.toString();
        }
        this.schema.forEach((kind) => {
            this.dumpByKind[kind].push(meta.kinds[kind].value)
        });
        const row: DumpRow = {};
        this.schema.map((kind) => {
            row[kind] = meta.kinds[kind].value;
        });
        const previous = this.rowsMeta.length !== 0 && this.rowsMeta[this.rowsMeta.length - 1] || null;
        this.rowsMeta.push(this.getMeta(row, previous, step))
    }

    public pushRow(row: DumpRow, step?: string) {
        if (this.rowsMeta.length > 50000) {
            this.rowsMeta = this.rowsMeta.slice(-10000);
        }

        this.step += 1;
        if (!step) {
            step = this.step.toString();
        }
        this.schema.forEach((kind) => {
            this.dumpByKind[kind].push(row[kind])
        });
        const previous = this.rowsMeta.length !== 0 && this.rowsMeta[this.rowsMeta.length - 1] || null;
        this.rowsMeta.push(this.getMeta(row, previous, step))
    }

    private getMeta(row: DumpRow, previous: DumpRowMeta | null, step: string): DumpRowMeta {
        const meta: DumpRowMeta = {kinds: {}, step};
        if (!previous) {
            this.schema.forEach((kind) => {
                meta.kinds[kind] = {diffPercent: 0, value: row[kind]}
            });
        } else {
            this.schema.forEach((kind) => {
                let diff = 100
                if (previous.kinds[kind].value === 0) {
                    if (row[kind] > 0) {
                        diff = 100;
                    } else {
                        diff = 0;
                    }
                } else {
                    diff = (row[kind] - previous.kinds[kind].value) / previous.kinds[kind].value;
                }
                meta.kinds[kind] = {diffPercent: diff, value: row[kind]}
            });
        }
        return meta
    }
}
