<template>
    <div class="container">
        <div class="value">{{ value }}</div>
        <div :class="[ isUp && 'up', isDown && 'down', !isUp && !isDown && 'neutral']" v-if="showDiff">
            <span v-if="isUp">&uarr;</span>
            <span v-if="isDown">&darr;</span>
            <span class="diff" v-if="isDown || isUp">{{ diffPercent }}%</span>
        </div>
    </div>
</template>

<script lang="ts">
    // @ts-ignore
    import Chart from './Chart.js';
    import {Component, Prop, Vue} from 'vue-property-decorator';

    @Component({
        components: {
            Chart,
        },
    })
    export default class CellWithDiff extends Vue {
        @Prop() private value!: number;
        @Prop() private diff!: number;
        @Prop() private showDiff!: boolean;

        private get isUp(): boolean {
            return this.diff > 0.0097;
        }

        private get isDown(): boolean {
            return this.diff < -0.097;
        }

        private get arrow(): string {
            return this.diff > 0 && '&uarr;' || '&darr;';
        }

        private get diffPercent(): string {
            return (this.diff * 100).toFixed(0);
        }
    }
</script>

<style scoped>
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .value {
        margin-right: 3px;
    }

    .diff {
        font-size: 12px;
    }

    .up {
        color: red;
    }

    .down {
        color: green;
    }
</style>
