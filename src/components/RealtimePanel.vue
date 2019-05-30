<template>
    <Panel header="'Dump Data'">
        <div class="chartContainer">
            <Chart :chart-data="chartData" :on-label-click="toggleKind"></Chart>
        </div>
        <div class="tableContainer">
            <table>
                <thead>
                <tr class='linesTable'>
                    <th>#</th>
                    <th v-for="name in labels">{{ name }}</th>
                    <th class="lineButton"></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="meta in rowsMeta">
                    <slot v-if="startWithButton" v-bind:meta="meta"></slot>
                    <td>{{ meta.step }}</td>
                    <td v-for="kind in kinds">
                        <CellWithDiff :meta="meta.kinds[kind]" :showDiff="showDiffs"></CellWithDiff>
                    </td>
                    <slot v-if="!startWithButton" v-bind:meta="meta"></slot>
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
        @Prop() private buttonAction!: (meta: DumpRowMeta) => void;
        @Prop() private showDiffs!: boolean;

        private get labels(): string[] {
            return this.kinds;
        }
    };

</script>

<style scoped>

</style>
