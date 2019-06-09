<template>
    <div id="app">
        <Main />
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import Main from '@/views/Main.vue';
    import {ServerStream} from '@/services/ServerStream';
    import {DumpDocument, TaggedRow} from '@/server/SharedTypes';
    import {Base64} from 'js-base64';

    let hasInit = false;
    @Component({
        components: {
            Main,
        },
    })
    export default class App extends Vue {
        private created() {
            if (!hasInit) {
                this.$store.dispatch('connect');
                hasInit = true;
            }
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        height: 100vh;
        width: 100%;
    }

    body {
        margin: 0;
    }

    div {
        box-sizing: border-box;
    }
</style>
