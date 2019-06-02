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

        <div class="button clearButton" @click="$emit('clear')">Clear</div>
        <div class="button" @click="$emit('copy-csv')">Copy Snapshot CSV</div>
        <div class="button" @click="$emit('copy-json')">Copy Snapshot JSON</div>
        <div class="button" @click="$emit('save-csv')">Save Snapshot CSV</div>
        <div class="button" @click="$emit('save-json')">Save Snapshot JSON</div>
        <div class="button" @click="$emit('save-state')">Save State</div>
        <div class="button" @click="$emit('load-state')">Load State</div>
    </div>
</template>

<script lang="ts">
    // @ts-ignore
    import Chart from '@/components/Chart.js';
    import {Component, Prop, Vue} from 'vue-property-decorator';

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
