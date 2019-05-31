<template>
    <Panel header="'Dump Data'">
        <div class="chartContainer">
            <Chart :chart-data="chartData" :on-label-click="toggleKind"></Chart>
        </div>
        <div class="tableContainer">
            <table>
                <thead>
                <tr class='linesTable'>
                    <th v-if="startWithButton"></th>
                    <th>#</th>
                    <th v-for="name in kinds">{{ name }}</th>
                    <th v-if="!startWithButton"></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="meta in rowsMeta">
                    <td v-if="startWithButton"
                        v-bind:meta="meta"
                        class="buttonCell"
                        v-on:click="onButtonAction(meta)">
                        <slot></slot>
                    </td>
                    <td>{{ meta.step }}</td>
                    <td v-for="kind in kinds">
                        <CellWithDiff :meta="meta.kinds[kind]" :showDiff="showDiffs"></CellWithDiff>
                    </td>
                    <td v-if="!startWithButton"
                        v-bind:meta="meta"
                        class="buttonCell"
                        v-on:click="onButtonAction(meta)">
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
    import {DumpRowMeta} from '@/services/Repository';
    import CellWithDiff from '@/components/CellWithDiff.vue';
    import Panel from '@/components/Panel.vue';
    // @ts-ignore
    import Chart from './Chart.js';

    @Component({
        components: {
            Panel,
            CellWithDiff,
            Chart,
        },
    })
    export default class RealtimePanel extends Vue {
        @Prop() private chartData!: ChartData;
        @Prop() private rowsMeta!: DumpRowMeta[];
        @Prop() private kinds!: string[];
        @Prop() private startWithButton!: boolean;
        @Prop() private toggleKind!: (kind: string) => void;
        @Prop() private onButtonAction!: (meta: DumpRowMeta) => void;
        @Prop() private showDiffs!: boolean;
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
