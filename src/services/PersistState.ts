import {Repository} from '@/services/Repository';

export class PersistState {
    public persist(tag: string, schema: string[], repo: Repository) {
        const obj = {
            rowsMeta: repo.rowsMeta,
            schema,
        };
        window.localStorage.setItem(tag, JSON.stringify(obj));
    }

    public load(tag: string, repo: Repository): string[] {
        const item: any = JSON.parse(window.localStorage.getItem(tag) as string);
        repo.clear();
        repo.rowsMeta = item.rowsMeta;
        return item.schema;
    }
}
