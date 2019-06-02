const ENTRY_NAME = 'excluded-mem-kinds';

export class ExcludedKinds {
    private excluded: boolean[];

    private storage = window.localStorage
    private schema: string[];

    constructor(schema: string[]) {
        this.schema = schema;
        this.excluded = schema.map(() => false);
    }

    public isExcluded(index: number): boolean {
        return this.excluded[index];
    }

    public load() {
        const raw = this.storage.getItem(this.getEntry());
        if (!raw) {
            return;
        }

        let saved: boolean[];
        try {
            saved = JSON.parse(raw) as boolean[];
        } catch (e) {
            console.log('Exception reading saved excluded items');
            this.storage.removeItem(this.getEntry())
            return
        }

        if (!saved) {
            return;
        }

        if (saved.length !== this.schema.length) {
            console.log('Saved excluded kinds lengh != schema length. Clearing it');
            this.storage.removeItem(this.getEntry());
            return;
        }

        this.excluded = saved;
    }

    public toggle(index: number) {
        this.excluded[index] = !this.excluded[index];
        const item = JSON.stringify(this.excluded);
        this.storage.setItem(this.getEntry(), item);
    }

    private getEntry(): string {
        return ENTRY_NAME + this.schema[0]
    }
}
