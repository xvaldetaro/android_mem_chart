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
                <input type="checkbox" @click="$emit('pause-clicked')" v-model="isPaused">
                Pause
            </label>
        </div>

        <div class="option">
            <label>
                <input type="checkbox" @click="$emit('show-diffs-clicked')" v-model="showDiffs">
                Show Diffs
            </label>
        </div>

    </div>
</template>

<script lang="ts">
    // @ts-ignore
    import Chart from './Chart.js';
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {DumpRowMeta, KindDumpMeta, Repository} from "@/services/Repository";

    @Component({
        components: {
            Chart,
        },
    })
    export default class Menu extends Vue {
        @Prop() private isPaused!: boolean;
        @Prop() private isConnected!: boolean;
        @Prop() private showDiffs!: boolean;
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
