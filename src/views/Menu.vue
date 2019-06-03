<template>
    <div class="menu">
        <div class="connectedContainer" v-if="isConnected">
            Connected!
        </div>
        <div class="connectionClosedContainer" v-else>
            Connection IS Closed!
        </div>

        <div class="option">
            <label>
                <input type="checkbox" @input="pauseToggled" :value="isPaused">
                Pause
            </label>
        </div>

        <div class="option">
            <label>
                <input type="checkbox" @input="showDiffsToggled" :value="showDiffs">
                Show Diffs
            </label>
        </div>

        <div class="button clearButton" @click="clearRepos">Clear</div>
        <div class="button" @click="copyCsv">Copy Snapshot CSV</div>
        <div class="button" @click="copyJson">Copy Snapshot JSON</div>
        <div class="button" @click="saveCsv">Save Snapshot CSV</div>
        <div class="button" @click="saveJson">Save Snapshot JSON</div>
        <div class="button" @click="saveState">Save State</div>
        <div class="button" @click="loadState">Load State</div>
    </div>
</template>

<script lang="ts">
    // @ts-ignore
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {mapMutations, mapState} from 'vuex';
    import {AppState} from '@/store';

    @Component({
        components: {
        },
        computed: mapState({
            isPaused: (state: AppState) => state.config.isPaused,
            showDiffs: (state: AppState) => state.config.showDiffs,
            isConnected: (state: AppState) => state.config.isConnected,
        }),
        methods: {
            ...mapMutations(['clearRepos', 'showDiffsToggled', 'pauseToggled']),
        },
    })
    export default class Menu extends Vue {

        private saveState() {
            // const persist = new PersistState();
            // persist.persist('snap', this.schema, this.snapRepo);
        }

        private loadState() {
            // const persist = new PersistState();
            // persist.load('snap', this.snapRepo);
        }

        private saveJson() {
            // this.download('snapshot.json', this.snapRepo.toJson());
        }

        private saveCsv() {
            // this.download('snapshot.csv', this.snapRepo.toCsv());
        }

        private copyJson() {
            // navigator.clipboard.writeText(this.snapRepo.toJson());
        }

        private copyCsv() {
            // navigator.clipboard.writeText(this.snapRepo.toCsv());
        }

    }
</script>

<style scoped>
    .menu {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        background-color: #2c3e50;
        color: #fafbfc;
        padding: 20px;
    }

    .button {
        color: black;
        background-color: #eff3f6;
        background-image: linear-gradient(-180deg, #fafbfc, #eff3f6 90%);
        border-radius: 3px;
        font-weight: bold;
        cursor: pointer;
        padding: 6px;
    }

    .clearButton {
        color: darkred;
    }

    .menu div:not(:first-child) {
        margin-top: 10px;
    }
    .connectedContainer {
        background-color: green;
    }

    .connectionClosedContainer {
        background-color: red;
    }
</style>
