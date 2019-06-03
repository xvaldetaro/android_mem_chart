<template>
    <div class="mainContainer" v-if="schema.length > 0">
        <Menu />

        <ChartWithTablePanel
                :title="'Realtime Data'"
                :chart-data="dumpChartData"
                :repo="dumpRepo"
                :start-with-button="false"
                :toggle-kind="toggleKind"
                :onButtonAction="saveRowSnapshot"
        >
            <span class="lineButton">&#9745</span>
        </ChartWithTablePanel>
        <ChartWithTablePanel
                :title="'Snapshots'"
                :chart-data="snapChartData"
                :repo="snapRepo"
                :start-with-button="true"
                :toggle-kind="toggleKind"
                :onButtonAction="deleteRowSnapshot"
        >
            <span class="snapshotButton">&#9746</span>
        </ChartWithTablePanel>
    </div>
</template>

<script lang="ts">
    // @ts-ignore
    import {Component, Vue} from 'vue-property-decorator';
    import {DumpDocument, Schema, TaggedRow} from '@/server/SharedTypes';
    import {ServerStream} from '@/services/ServerStream';
    import CellWithDiff from '@/components/CellWithDiff.vue';
    import Menu from '@/views/Menu.vue';
    import Panel from '@/components/Panel.vue';
    import ChartWithTablePanel from '@/components/ChartWithTablePanel.vue';
    import {mapGetters, mapState} from 'vuex';

    @Component({
        components: {
            ChartWithTablePanel,
            Panel,
            Menu,
            CellWithDiff,
        },
        computed: {
            ...mapState(['dumpRepo', 'snapRepo']),
            ...mapGetters(['dumpChartData', 'snapChartData']),
        },
    })
    export default class Main extends Vue {

        private server = new ServerStream();

        protected created() {
            this.server.connect((doc: DumpDocument) => {
                this.$store.dispatch('bootstrap', {schema: doc.schema, loadedSnaps: doc.rows});
                this.server.setDumpListener((row: TaggedRow) => {
                    if (!this.$store.state.config.isPaused) {
                        this.$store.dispatch('pushDumpRow', row);
                    }
                });
            });
        }

        private get schema(): Schema {
            return this.$store.state.schema;
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

        private toggleKind(kind: number) {
            this.$store.dispatch('toggleKind', kind);
        }

        private saveRowSnapshot(taggedRow: TaggedRow) {
            this.$store.commit('pushSnapRow', taggedRow);
        }

        private deleteRowSnapshot(taggedRow: TaggedRow) {
            this.$store.commit('deleteSnapRow', taggedRow.tag);
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

    .snapshotButton {
        color: #ec0d0d;
    }

    .lineButton {
        color: #3cbd01;
    }

</style>
