export type DumpRow = number[];

export interface TaggedRow {
    row: DumpRow;
    tag: string;
}

export type Schema = string[];

export interface DumpDocument {
    schema: Schema;
    rows: TaggedRow[];
}

export type Payload = TaggedRow | DumpDocument;

export function isDocument(payload: Payload): payload is DumpDocument {
    return (payload as DumpDocument).schema !== undefined;
}

export function isTaggedRow(payload: Payload): payload is TaggedRow {
    return !isDocument(payload);
}

export class Optional<T> {
    private t: T | undefined;

    constructor(t?: T) {
        this.t = t;
    }

    public get(): T | undefined {
        return this.t;
    }

    public map<R>(mapper: ((t: T) => R)): Optional<R> {
        if (this.t) {
            return new Optional<R>(mapper(this.t));
        } else {
            return new Optional<R>();
        }
    }
}
