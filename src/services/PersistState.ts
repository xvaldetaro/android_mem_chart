import {Repo} from '@/store';

export function persist(tag: string, schema: string[], repo: Repo) {
    return [];
    // const obj = {
    //     rowsMeta: repo.rowsMeta,
    //     schema,
    // };
    // window.localStorage.setItem(tag, JSON.stringify(obj));
}

export function load(tag: string, repo: Repo): string[] {
    return [];
    // const item: any = JSON.parse(window.localStorage.getItem(tag) as string);
    // repo.clear();
    // repo.rowsMeta = item.rowsMeta;
    // return item.schema;
}
