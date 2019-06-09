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
                Hide Diffs
            </label>
        </div>

        <input class="inputfile" type="file" @change="loadFile" id="file"/>
        <label class="button" for="file">Load JSON</label>
        <div class="button clearButton" @click="clearRepos">Clear</div>
        <div class="button" @click="saveCsv">Save Snapshot CSV</div>
        <div class="button" @click="saveJson">Save Snapshot JSON</div>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import {mapMutations, mapState} from 'vuex';
    import {AppState, Repo} from '@/store';
    import {persistDocument} from '@/services/PersistState';
    import {DumpDocument, Schema} from '@/server/SharedTypes';
    import {toJson} from '@/services/Repository';

    interface HTMLInputEvent extends Event {
        target: HTMLInputElement & EventTarget;
    }

    @Component({
        components: {
        },
        computed: mapState({
            isPaused: (state: AppState) => state.config.isPaused,
            showDiffs: (state: AppState) => state.config.showDiffs,
            isConnected: (state: AppState) => state.config.isConnected,
            schema: (state: AppState) => state.schema,
            snapRepo: (state: AppState) => state.snapRepo,
        }),
        methods: {
            ...mapMutations(['clearRepos', 'showDiffsToggled', 'pauseToggled', 'swapSnapRepo']),
        },
    })
    export default class Menu extends Vue {
        private schema!: Schema;
        private snapRepo!: Repo;
        private swapSnapRepo!: (doc: DumpDocument) => void;

        private saveState() {
            persistDocument('snap', this.schema, this.snapRepo);
        }

        private loadFile(value: HTMLInputEvent) {
            const file = value.target.files && value.target.files[0];
            if (file) {
                this.$store.dispatch('loadFile', file);
            }
        }

        private saveJson() {
            this.download('snapshot.json', toJson(this.schema, this.snapRepo));
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
        font-size: 14px;
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

    .menu :not(:first-child) {
        margin-top: 10px;
    }
    .connectedContainer {
        background-color: green;
    }

    .connectionClosedContainer {
        background-color: red;
    }

    .inputfile {
        width: 0.1px;
        height: 0.1px;
        opacity: 0;
        overflow: hidden;
        position: absolute;
        z-index: -1;
    }
</style>
