import {Repo} from '@/store';
import {DumpDocument, Schema} from '@/server/SharedTypes';
import {hashCode} from '@/services/HashCodes';

export function persistDocument(tag: string, schema: string[], repo: Repo) {
    const obj = {
        rows: repo.rows.map((row, index) => ({row, tag: repo.tags[index]})),
        schema,
    };
    window.localStorage.setItem(tag, JSON.stringify(obj));
}

export function loadDocument(tag: string): DumpDocument | null {
    try {
        const doc = JSON.parse(window.localStorage.getItem(tag) as string)
        if (doc.schema === null || !doc.rows.length) {
            return null;
        }
        return doc;
    } catch {
        console.log('Error loading local storage document');
        return null;
    }
}

export function loadExcluded(schema: Schema): boolean[] {
    const tag = getExcludedTag(schema);
    const raw = window.localStorage.getItem(tag);
    const out = schema.map(() => false);
    if (!raw) {
        return out;
    }

    try {
        return JSON.parse(raw) as boolean[];
    } catch (e) {
        console.log('Exception reading saved excluded items');
        window.localStorage.removeItem(tag);
        return out;
    }
}

export function persistExcluded(schema: Schema, excludedIndices: boolean[]) {
    const item = JSON.stringify(excludedIndices);
    window.localStorage.setItem(getExcludedTag(schema), item);
}

const excludedKindsTag = 'EXCLUDED_KINDS';
function getExcludedTag(schema: Schema) {
    return hashCode(excludedKindsTag + schema.join('')).toString();
}
