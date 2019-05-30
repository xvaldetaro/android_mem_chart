<template>
    <div class="mainContainer">
        <Menu
                :isPaused="isPaused"
                @pause-clicked="onPauseClicked"
                :showDiffs="showDiffs"
                @show-diffs-clicked="onShowDiffsClicked"
                :isConnected="isConnected"
                @clear="clear"
                @copy-csv="copyCsv"
                @copy-json="copyJson"
                @save-csv="saveCsv"
                @save-json="saveJson"
                @save-state="saveState"
                @load-state="loadState"
        />

        <RealtimePanel
                :chart-data="dumpChartData"
                :rows-meta="dumpRows"
                :kinds="kinds"
                :start-with-button="false"
                :toggle-kind="toggleKind"
                :show-diffs="showDiffs"
        >
            <td class='button lineButton' v-on:click="saveRowSnapshot(meta)">&#9745</td>
        </RealtimePanel>
        <RealtimePanel
                :chart-data="snapChartData"
                :rows-meta="snapRows"
                :kinds="kinds"
                :start-with-button="true"
                :toggle-kind="toggleKind"
                :show-diffs="showDiffs"
        >
            <td class='button snapshotButton' v-on:click="deleteRowSnapshot(meta)">&#9746</td>
        </RealtimePanel>
    </div>
</template>

<script lang="ts">
    // @ts-ignore
    import Chart from './Chart.js';
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {DumpRowMeta, Repository} from '@/services/Repository';
    import {DumpRow, Payload} from '@/shared/SharedTypes';
    import {ServerStream} from '@/services/ServerStream';
    import {ExcludedKinds} from '@/services/ExcludedKinds';
    import CellWithDiff from '@/components/CellWithDiff.vue';
    import Menu from '@/components/Menu.vue';
    import {PersistState} from '@/services/PersistState';
    import Panel from '@/components/Panel.vue';
    import RealtimePanel from '@/components/RealtimePanel.vue';

    @Component({
        components: {
            RealtimePanel,
            Panel,
            Menu,
            CellWithDiff,
            Chart,
        },
    })
    export default class Main extends Vue {

        @Prop() private server!: ServerStream;
        @Prop() private schema!: string[];
        @Prop() private fileDump!: DumpRow[] | null;

        private stepCount = 20;
        private isPaused = false;
        private showDiffs = true;
        private excludedKinds = new ExcludedKinds(this.schema);
        private kinds: string[] = [];
        private dumpRepo = new Repository(this.excludedKinds, this.schema);
        private snapRepo = new Repository(this.excludedKinds, this.schema);
        private dumpChartData = this.dumpRepo.toChartData(this.stepCount);
        private snapChartData = this.snapRepo.toChartData(this.stepCount);

        protected created() {
            this.excludedKinds.load();
            this.saveKinds();
            if (this.fileDump) {
                this.fileDump.forEach((row) => {
                    this.dumpRepo.pushRow(row);
                    this.dumpChartData = this.dumpRepo.toChartData(this.stepCount);
                });
            } else {
                this.server.setDumpListener((row: DumpRow) => {
                    if (!this.isPaused) {
                        this.dumpRepo.pushRow(row);
                        this.dumpChartData = this.dumpRepo.toChartData(this.stepCount);
                    }
                });
            }
        }

        private onShowDiffsClicked() {
            this.showDiffs = !this.showDiffs;
        }

        private onPauseClicked() {
            this.isPaused = !this.isPaused;
        }

        private clear() {
            this.dumpRepo.clear();
            this.snapRepo.clear();
        }

        private saveState() {
            const persist = new PersistState();
            persist.persist('snap', this.schema, this.snapRepo);
        }

        private loadState() {
            const persist = new PersistState();
            persist.load('snap', this.snapRepo);
        }

        private saveJson() {
            this.download('snapshot.json', this.snapRepo.toJson());
        }

        private saveCsv() {
            this.download('snapshot.csv', this.snapRepo.toCsv());
        }

        private download(filename: string, text: string) {
            const pom = document.createElement('a');
            pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            pom.setAttribute('download', filename);

            if (document.createEvent) {
                const event = document.createEvent('MouseEvents');
                event.initEvent('click', true, true);
                pom.dispatchEvent(event);
            } else {
                pom.click();
            }
        }

        private copyJson() {
            navigator.clipboard.writeText(this.snapRepo.toJson());
        }

        private copyCsv() {
            navigator.clipboard.writeText(this.snapRepo.toCsv());
        }

        private toggleKind(kind: string) {
            this.excludedKinds.toggle(kind);
            this.dumpChartData = this.dumpRepo.toChartData(this.stepCount);
            this.snapChartData = this.snapRepo.toChartData(this.stepCount);
            this.saveKinds();
        }

        private saveRowSnapshot(meta: DumpRowMeta) {
            this.snapRepo.pushRowMeta(meta);
            this.snapChartData = this.snapRepo.toChartData(this.stepCount);
        }

        private deleteRowSnapshot(meta: DumpRowMeta) {
            this.snapRepo.deleteRow(meta.step);
            this.snapChartData = this.snapRepo.toChartData(this.stepCount);
        }

        private get dumpRows(): DumpRowMeta[] {
            return this.computeRows(this.dumpRepo);
        }

        private get snapRows(): DumpRowMeta[] {
            return this.computeRows(this.snapRepo);
        }

        private computeRows(repo: Repository): DumpRowMeta[] {
            const rowSlice = repo.rowsMeta.slice(-100);
            rowSlice.reverse();
            return rowSlice;
        }

        private get isConnected(): boolean {
            return this.server.isConnected;
        }

        private get labels(): string[] {
            return this.kinds;
        }

        private saveKinds(): string[] {
            this.kinds = this.schema.filter((kind) => !this.excludedKinds.isExcluded(kind)).map((kind) => kind);
            return this.kinds;
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    .mainContainer {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        padding-bottom: 40px;
        height: 100%;
    }

    .mainContainer div:not(:last-child) {
        margin-right: 20px;
    }

    .tableContainer {
        flex-grow: 1;
        overflow-y: scroll;
    }

    .button {
        background-color: #eff3f6;
        background-image: linear-gradient(-180deg, #fafbfc, #eff3f6 90%);
        font-weight: bold;
        cursor: pointer;
    }

    .snapshotButton {
        color: #ec0d0d;
    }

    .lineButton {
        color: #3cbd01;
    }

    table {
        border-collapse: collapse;
        overflow-y: scroll;
        overflow-x: hidden;
        width: 100%;
    }

    th {
        background-color: #2c3e50;
        color: ghostwhite;
        font-size: 13px;
        padding: 8px 4px 8px 4px;
    }

    tr:nth-child(even) {
        background-color: #f2f2f2;
    }

    td {
        font-size: 14px;
        padding: 6px 2px 6px 2px;
        border-right: 1px solid #d2d2d2;
    }

    td:last-child {
        border-right: 0;
    }

</style>
