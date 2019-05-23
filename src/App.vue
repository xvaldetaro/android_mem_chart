<template>
    <div id="app">
        <Main v-if="schema" :server="server" :schema="schema" :file-dump="fileDump" />
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import Main from '@/components/Main.vue';
    import {ServerStream} from '@/services/ServerStream';
    import {DumpRow, Payload} from '@/shared/SharedTypes';
    import {Base64} from 'js-base64';

    @Component({
        components: {
            Main,
        },
    })
    export default class App extends Vue {
        private schema: string[] | null = null;
        private server = new ServerStream();
        private fileDump: DumpRow[] | null = null;

        protected created() {
            const splitUrl = window.location.href.split('?dump=');
            if (splitUrl.length > 1) {
                const json = Base64.decode(splitUrl[1]);
                this.fileDump = JSON.parse(json) as DumpRow[];
                this.schema = Object.keys(this.fileDump[0])
            } else {
                this.server.connect((schema: string[]) => {
                    this.schema = schema;
                });
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
        height: 100%;
        width: 100%;
    }
</style>
