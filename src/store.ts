import Vue from 'vue';
import Vuex from 'vuex';
import {DumpDocument, Schema, TaggedRow} from '@/server/SharedTypes';
import {deleteRow, pushRow, toChartData} from '@/services/Repository';
import {loadExcluded, persistExcluded} from '@/services/PersistState';
import {ServerStream} from '@/services/ServerStream';

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
        setExcluded(state, excluded) {
            state.excludedIndices = excluded;
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
        swapSnapRepo(state, doc: DumpDocument) {
            const repo = {rows: [], tags: [], diffs: []} as Repo;
            doc.rows.forEach((taggedRow, index) => {
                pushRow(repo, taggedRow)
            });
            state.snapRepo = repo;
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
        connectionChanged({config}, isConnected) {
            config.isConnected = isConnected;
        },
    },
    actions: {
        connect({dispatch, commit, state}) {
            const server = new ServerStream(
                () => {
                        commit('connectionChanged', true)
                },
                (doc: DumpDocument) => {
                    dispatch('bootstrap', doc)
                },
                (row: TaggedRow) => {
                    if (!state.config.isPaused) {
                        commit('pushDumpRow', row);
                    }
                },
                () => {
                    commit('connectionChanged', false)
                },
            );

            server.connect();
        },
        bootstrap({commit, state}, {schema, rows}) {
            if (state.schema.length === 0) {
                commit('setSchema', schema);
                commit('setExcluded', loadExcluded(schema));
            }
            commit('pushSnapRowMultiple', rows);
        },
        loadFile({dispatch, commit, state}, file) {
            return new Promise<DumpDocument>((res, rej) => {
                const reader = new FileReader();
                reader.readAsText(file, 'UTF-8');
                reader.onload = (evt: any) => {
                    const contents = JSON.parse(evt.target.result);
                    if (contents.schema && contents.rows) {
                        return res(contents)
                    }
                    rej();
                };
                reader.onerror = (evt) => {
                    rej()
                }
            }).then((document: DumpDocument) => dispatch('bootstrap', document))
        },
        pushDumpRow({commit, state}, taggedRow: TaggedRow) {
            commit('pushDumpRow', taggedRow);
        },
        toggleKind({state, commit}, index: number) {
            commit('toggleKind', index);
            persistExcluded(state.schema, state.excludedIndices);
        },
    },
    // plugins: [
    //     (store => {
    //         store.subscribe((mutation, state) => {
    //             if (mutation.type === 'toggleKind') {
    //             }
    //         });
    //     }),
    // ],
});

