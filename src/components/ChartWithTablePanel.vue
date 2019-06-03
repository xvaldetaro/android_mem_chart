<template>
    <Panel :header="title">
        <div class="chartContainer">
            <Chart :chart-data="chartData" :on-label-click="toggleKind"></Chart>
        </div>
        <div class="tableContainer">
            <table>
                <thead>
                <tr class='linesTable'>
                    <th v-if="startWithButton"></th>
                    <th>#</th>
                    <th v-for="index in includedKindIndices">{{ schema[index] }}</th>
                    <th v-if="!startWithButton"></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(row, rowIndex) in rows">
                    <td v-if="startWithButton"
                        class="buttonCell"
                        v-on:click="onButtonAction({tag: repo.tags[rowIndex], row})">
                        <slot></slot>
                    </td>
                    <td>{{ repo.tags[rowIndex] }}</td>
                    <td v-for="kindIndex in includedKindIndices">
                        <CellWithDiff :value="row[kindIndex]"
                                      :diff="repo.diffs[rowIndex][kindIndex]"
                                      :showDiff="config.showDiffs" />
                    </td>
                    <td v-if="!startWithButton"
                        class="buttonCell"
                        v-on:click="onButtonAction({tag: repo.tags[rowIndex], row})">
                        <slot></slot>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </Panel>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {ChartData} from '@/services/ChartConstants';
    import CellWithDiff from '@/components/CellWithDiff.vue';
    import Panel from '@/components/Panel.vue';
    // @ts-ignore
    import Chart from './Chart.js';
    import {mapGetters, mapState} from 'vuex';
    import {Repo} from '@/store';
    import {Schema, TaggedRow} from '@/server/SharedTypes';
    import {toChartData} from '@/services/Repository';

    @Component({
        components: {
            Panel,
            CellWithDiff,
            Chart,
        },
        computed: {
            ...mapState(['config', 'schema', 'excludedIndices']),
            ...mapGetters(['includedKindIndices']),
        },
    })
    export default class ChartWithTablePanel extends Vue {
        @Prop() private title!: string;
        @Prop() private repo!: Repo;
        @Prop() private startWithButton!: boolean;
        @Prop() private toggleKind!: (kind: string) => void;
        @Prop() private onButtonAction!: (taggedRow: TaggedRow) => void;
        private schema!: Schema;
        private excludedIndices!: boolean[];

        get chartData(): ChartData {
            return toChartData(20, this.repo, this.schema, this.excludedIndices);
        }

        get rows(): number[][] {
            return this.repo.rows;
        }
    };

</script>

<style scoped>

    .buttonCell {
        background-color: #eff3f6;
        background-image: linear-gradient(-180deg, #fafbfc, #eff3f6 90%);
        font-weight: bold;
        cursor: pointer;
    }

    .tableContainer {
        flex-grow: 1;
        overflow-y: scroll;
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
