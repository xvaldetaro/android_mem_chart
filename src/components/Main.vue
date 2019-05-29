<template>
    <div v-if="schema" class="rootContainer">
        <div class="mainContainer">
            <Menu
                    :isPaused="isPaused"
                    @pause-clicked="onPauseClicked"
                    :showDiffs="showDiffs"
                    @show-diffs-clicked="onShowDiffsClicked"
                    :isConnected="isConnected"
            />
            <div class="sideContainer dumpContainer">
                <div class="header">
                    Dump Data
                </div>
                <div class="chartContainer">
                    <Chart :chart-data="dumpChartData" :on-label-click="toggleKind"></Chart>
                </div>
                <div class="tableContainer">
                    <table>
                        <thead>
                        <tr class='linesTable'>
                            <th>#</th>
                            <th v-for="name in labels">{{ name }}</th>
                            <th>Save</th>
                        </tr>
                        </thead>
                        <tbody>
                          <tr v-for="meta in dumpRows">
                              <td>{{ meta.step }}</td>
                              <td v-for="kind in kinds">
                                  <CellWithDiff :meta="meta.kinds[kind]" :showDiff="showDiffs" />
                              </td>
                              <td class='button lineButton' v-on:click="saveRowSnapshot(meta)">&#9745</td>
                          </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="sideContainer">
                <div class="header">
                    Snapshots
                </div>
                <div class="chartContainer">
                    <Chart :chart-data="snapChartData" :on-label-click="toggleKind"></Chart>
                </div>
                <div class="tableContainer">
                    <table>
                        <thead>
                        <tr class='snapshotTable'>
                            <th>Delete</th>
                            <th>#</th>
                            <th v-for="name in labels">{{ name }}</th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr v-for="meta in snapRows">
                                <td class='button snapshotButton' v-on:click="deleteRowSnapshot(meta)">&#9746</td>
                                <td>{{ meta.step }}</td>
                                <td v-for="kind in kinds">
                                    <CellWithDiff :meta="meta.kinds[kind]" :showDiff="showDiffs" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
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

    @Component({
        components: {
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
                    this.dumpRepo.pushRow(row)
                    this.dumpChartData = this.dumpRepo.toChartData(this.stepCount)
                })
            } else {
                this.server.setDumpListener((row: DumpRow) => {
                    if (!this.isPaused) {
                        this.dumpRepo.pushRow(row)
                        this.dumpChartData = this.dumpRepo.toChartData(this.stepCount)
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

        private toggleKind(kind: string) {
            this.excludedKinds.toggle(kind);
            this.dumpChartData = this.dumpRepo.toChartData(this.stepCount)
            this.snapChartData = this.snapRepo.toChartData(this.stepCount)
            this.saveKinds()
        }

        private saveRowSnapshot(meta: DumpRowMeta) {
            this.snapRepo.pushRowMeta(meta);
            this.snapChartData = this.snapRepo.toChartData(this.stepCount)
        }

        private deleteRowSnapshot(meta: DumpRowMeta) {
            this.snapRepo.deleteRow(meta.step);
            this.snapChartData = this.snapRepo.toChartData(this.stepCount)
        }

        private get dumpRows(): DumpRowMeta[] {
            return this.computeRows(this.dumpRepo)
        }

        private get snapRows(): DumpRowMeta[] {
            return this.computeRows(this.snapRepo)
        }

        private computeRows(repo: Repository): DumpRowMeta[] {
            const rowSlice = repo.rowsMeta.slice(-100);
            rowSlice.reverse();
            return rowSlice;
        }

        private get isConnected(): boolean {
            return this.server.isConnected
        }

        private get labels(): string[] {
            return this.kinds;
        }

        private saveKinds(): string[] {
            this.kinds = this.schema.filter((kind) => !this.excludedKinds.isExcluded(kind)).map((kind) => kind)
            return this.kinds
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .rootContainer {
        box-sizing: border-box;
        height: 100%;
    }

    .mainContainer {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        padding-bottom: 40px;
        height: 100%;
    }

    .sideContainer {
        margin: 10px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        width: 700px;
        border: 1px solid #d4d4d4;
        border-radius: 10px;
        height: 100%;
        padding-bottom: 25px;
    }

    .sideContainer > div {
        margin-left: 25px;
        margin-right: 25px;
    }

    .sideContainer > div:not(:first-child) {
        margin-top: 40px;
    }

    .sideContainer .header {
        border-bottom: 1px solid #d4d4d4;
        margin: 0;
        padding: 12px;
        font-size: 16px;
    }

    .dumpContainer {
        margin-right: 10px;
    }

    .tableContainer {
        flex-grow: 1;
        overflow-y: scroll;
    }

    .chartContainer {
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
