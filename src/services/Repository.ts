import {DumpRow} from '@/shared/SharedTypes';
import {ChartData, kindToColor} from '@/services/ChartConstants';
import {ExcludedKinds} from '@/services/ExcludedKinds';

export interface DumpByKind {
    [key: string]: number[];
}

export class Repository {
    public rows: DumpRow[] = [];
    public steps: string[] = [];
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
        const labels: string[] = this.sliceSteps(count);
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

    public sliceRows(count: number): DumpRow[] {
        return this.rows.slice(-1 * count);
    }

    public sliceSteps(count: number): string[] {
        return this.steps.slice(-1 * count);
    }

    public deleteRow(step: string) {
        const index = this.steps.findIndex((e) => e === step)
        if (index !== -1) {
            this.steps.splice(index, 1)
            this.rows.splice(index, 1)
            Object.keys(this.dumpByKind).forEach((key) => this.dumpByKind[key].splice(index, 1));
        }
    }

    public pushRow(row: DumpRow, step?: string) {
        if (this.rows.length > 50000) {
            this.rows = this.rows.slice(-10000);
        }

        this.step += 1;
        if (!step) {
            step = this.step.toString();
        }
        this.steps.push(step);
        this.schema.forEach((kind) => {
            this.dumpByKind[kind].push(row[kind])
        });
        this.rows.push(row);
    }
}
