import Vue from 'vue';
import Vuex from 'vuex';
import {ChartData} from '@/services/ChartConstants';
import {DumpRow, Schema, TaggedRow} from '@/server/SharedTypes';
import {deleteRow, pushRow, toChartData} from '@/services/Repository';

Vue.use(Vuex);

export interface Repo {
    rows: number[][];
    tags: string[];
    diffs: number[][];
}

export interface AppState {
    config: {
        isPaused: boolean;
        showDiffs: boolean;
        isConnected: boolean;
        chartXCount: number;
    },
    schema: Schema;
    excludedIndices: boolean[];
    dumpRepo: Repo;
    snapRepo: Repo;
}

export default new Vuex.Store({
    state: {
        config: {
            isPaused: false,
            showDiffs: true,
            isConnected: false,
            chartXCount: 20,
        },
        schema: [],
        excludedIndices: [] as boolean[],
        dumpRepo: {rows: [], tags: [], diffs: []} as Repo,
        snapRepo: {rows: [], tags: [], diffs: []} as Repo,
    },
    getters: {
        dumpChartData: ({config, schema, dumpRepo, excludedIndices}) => {
            return toChartData(config.chartXCount, dumpRepo, schema, excludedIndices);
        },
        snapChartData: ({config, schema, snapRepo, excludedIndices}) => {
            return toChartData(config.chartXCount, snapRepo, schema, excludedIndices);
        },
        includedKindIndices: ({schema, excludedIndices}) => {
            return schema.map((_, index) => index).filter((kind, index) => !excludedIndices[index]);
        },
    },
    mutations: {
        pauseToggled(state) {
            state.config.isPaused = !state.config.isPaused;
        },
        showDiffsToggled(state) {
            state.config.showDiffs = !state.config.showDiffs;
        },
        setSchema(state, schema) {
            state.schema = schema;
        },
        setExcluded(state) {
            state.excludedIndices = state.schema.map(() => false);
        },
        pushDumpRow({dumpRepo}, taggedRow: TaggedRow) {
            pushRow(dumpRepo, taggedRow);
        },
        pushSnapRowMultiple({snapRepo}, taggedRows: TaggedRow[]) {
            taggedRows.forEach(taggedRow => {
                pushRow(snapRepo, taggedRow);
            });
        },
        pushSnapRow({snapRepo}, taggedRow: TaggedRow) {
            pushRow(snapRepo, taggedRow);
        },
        deleteSnapRow({snapRepo}, tag: string) {
            deleteRow(snapRepo, tag);
        },
        clearRepos(state) {
            state.dumpRepo = {rows: [], tags: [], diffs: []} as Repo;
            state.snapRepo = {rows: [], tags: [], diffs: []} as Repo;
        },
        toggleKind(state, index: number) {
            const aaa = state.excludedIndices.slice();
            aaa[index] = !aaa[index];
            state.excludedIndices = aaa;
        },
        onConnect({config}) {
            config.isConnected = true;
        },
    },
    actions: {
        bootstrap({commit}, {schema, loadedSnaps}) {
            commit('setSchema', schema);
            commit('setExcluded', schema);
            commit('onConnect', true);
            commit('pushSnapRowMultiple', loadedSnaps);
        },
        pushDumpRow({commit, state}, taggedRow: TaggedRow) {
            commit('pushDumpRow', taggedRow);
        },
    },
});
