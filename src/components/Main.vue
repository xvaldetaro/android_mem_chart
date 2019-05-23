<template>
    <div v-if="schema" class="rootContainer">
        <div class="connectionClosedContainer" v-if="isDisconnected">
            Connection IS Closed
        </div>

        <div class="pauseContainer">
            <label>
                <input type="checkbox" @click="onPauseClicked" v-model="isPaused">
                Pause
            </label>
        </div>

        <div class="mainContainer">

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
                          <tr v-for="pair in dumpRows">
                              <td>{{ pair.step }}</td>
                              <td v-for="kind in kinds">{{ pair.row[kind] }}</td>
                              <td class='button lineButton' v-on:click="saveRowSnapshot(pair)">&#9745</td>
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
                            <tr v-for="pair in snapRows">
                                <td class='button snapshotButton' v-on:click="deleteRowSnapshot(pair)">&#9746</td>
                                <td>{{ pair.step }}</td>
                                <td v-for="kind in kinds">{{ pair.row[kind] }}</td>
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
    import {Repository} from '@/services/Repository';
    import {DumpRow, Payload} from '@/shared/SharedTypes';
    import {ServerStream} from '@/services/ServerStream';
    import {ExcludedKinds} from '@/services/ExcludedKinds';

    interface RowWithStep {
        step: string,
        row: DumpRow,
    }

    @Component({
        components: {
            Chart,
        },
    })
    export default class Main extends Vue {

        @Prop() private server!: ServerStream;
        @Prop() private schema!: string[];
        @Prop() private fileDump!: DumpRow[] | null;

        private stepCount = 20;
        private isPaused = false;
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

        private onPauseClicked() {
            this.isPaused = !this.isPaused;
        }

        private toggleKind(kind: string) {
            this.excludedKinds.toggle(kind);
            this.dumpChartData = this.dumpRepo.toChartData(this.stepCount)
            this.snapChartData = this.snapRepo.toChartData(this.stepCount)
            this.saveKinds()
        }

        private saveRowSnapshot(pair: RowWithStep) {
            this.snapRepo.pushRow(pair.row, pair.step)
            this.snapChartData = this.snapRepo.toChartData(this.stepCount)
        }

        private deleteRowSnapshot(pair: RowWithStep) {
            this.snapRepo.deleteRow(pair.step);
            this.snapChartData = this.snapRepo.toChartData(this.stepCount)
        }

        private get dumpRows(): RowWithStep[] {
            return this.computeRows(this.dumpRepo)
        }

        private get snapRows(): RowWithStep[] {
            return this.computeRows(this.snapRepo)
        }

        private computeRows(repo: Repository): RowWithStep[] {
            const rowSlice = repo.rows.slice(-50);
            const stepSlice = repo.steps.slice(-50);
            const pairs = rowSlice.map((row, index) => ({row, step: stepSlice[index]}));
            pairs.reverse();
            return pairs;
        }

        private get isDisconnected(): boolean {
            return !this.server.isConnected
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
    .mainContainer {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        padding-bottom: 40px;
    }

    .sideContainer {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        width: 700px;
        border: 1px solid #d4d4d4;
        border-radius: 10px;
    }

    .sideContainer > div {
        margin: 0 25px 0 25px;
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
    }

    .chartContainer {
        margin-bottom: 40px;
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

    tr:nth-child(even) {
        background-color: #f2f2f2
    }

    table {
        border-collapse: collapse;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    th {
        font-size: 12px;
        padding: 4px 8px 4px 8px;
    }

    table, th, td {
        border: 1px solid #030303;
    }

    tr.linesTable th:last-child {
        width: 1%;
        white-space: nowrap;
    }

    tr.snapshotTable th:first-child {
        width: 1%;
        white-space: nowrap;
    }

    .connectionClosedContainer {
        color: white;
        background-color: red;
    }
</style>
