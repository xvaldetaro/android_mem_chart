<template>
    <div class="container">
        <div class="value">{{ value }}</div>
        <div :class="[ isUp && 'up', isDown && 'down', !isUp && !isDown && 'neutral']" v-if="showDiff">
            <span v-if="isUp">&uarr;</span>
            <span v-if="isDown">&darr;</span>
<!--            <span v-if="!isDown && !isUp">&harr;</span>-->
            <span class="diff" v-if="isDown || isUp">{{ diff }}%</span>
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
    export default class CellWithDiff extends Vue {
        @Prop() private meta!: KindDumpMeta;
        @Prop() private showDiff!: boolean;

        private get value(): string {
            return this.meta.value.toString();
        }

        private get isUp(): boolean {
            return this.meta.diffPercent > 0.0097;
        }

        private get isDown(): boolean {
            return this.meta.diffPercent < -0.097;
        }

        private get arrow(): string {
            return this.meta.diffPercent > 0 && '&uarr;' || '&darr;';
        }

        private get diff(): string {
            return (this.meta.diffPercent * 100).toFixed(0);
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
