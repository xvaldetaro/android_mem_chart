interface Mask { [key: string]: boolean }

const ENTRY_NAME = 'excluded-mem-kinds';
export class ExcludedKinds {
    private excluded: Mask = {};

    private storage = window.localStorage
    private schema: string[];

    constructor(schema: string[]) {
        this.schema = schema;
    }

    public isExcluded(kind: string): boolean {
        return this.excluded[kind]
    }

    public load() {
        const raw = this.storage.getItem(ENTRY_NAME + this.schema[0]);
        if (!raw) {
            return;
        }

        let saved: Mask;
        try {
            saved = JSON.parse(raw) as Mask;
        } catch (e) {
            console.log('Exception reading saved excluded items');
            this.storage.clear();
            return
        }

        if (saved) {
            this.schema.forEach((kind) => {
                this.excluded[kind] = saved[kind]
            })
        }
    }

    public toggle(kind: string) {
        this.excluded[kind] = !this.excluded[kind];
        const item = JSON.stringify(this.excluded);
        this.storage.setItem(ENTRY_NAME + this.schema[0], item);
    }
}
