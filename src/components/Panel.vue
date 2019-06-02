<template>
    <div class="sideContainer">
        <div class="header">
            {{ header }}
        </div>
        <slot></slot>
    </div>
</template>

<script lang="ts">
    // @ts-ignore
    import {Component, Prop, Vue} from 'vue-property-decorator';

    @Component({
        components: {},
    })
    export default class Panel extends Vue {
        @Prop() private header!: string;
    }
</script>

<style scoped>

    .sideContainer {
        margin: 10px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        width: 700px;
        border: 1px solid #d4d4d4;
        border-radius: 10px;
        height: 100%;
        padding-bottom: 25px;
    }

    .sideContainer > div {
        margin-left: 25px;
        margin-right: 25px;
    }

    .sideContainer > div:not(:first-child) {
        margin-top: 40px;
    }

    .sideContainer .header {
        border-bottom: 1px solid #d4d4d4;
        margin: 0;
        padding: 12px;
        font-size: 16px;
    }

</style>
