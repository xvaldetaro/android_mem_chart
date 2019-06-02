<template>
    <div id="app">
        <Main v-if="schema" :server="server" :schema="schema" :file-dump="fileDump"/>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import Main from '@/components/Main.vue';
    import {ServerStream} from '@/services/ServerStream';
    import {DumpDocument, TaggedRow} from '@/server/SharedTypes';
    import {Base64} from 'js-base64';

    @Component({
        components: {
            Main,
        },
    })
    export default class App extends Vue {
        private schema: string[] | null = null;
        private server = new ServerStream();
        private fileDump: TaggedRow[] | null = null;

        protected created() {
            const splitUrl = window.location.href.split('?dump=');
            if (splitUrl.length > 1) {
                const json = Base64.decode(splitUrl[1]);
                this.fileDump = JSON.parse(json) as TaggedRow[];
                this.schema = Object.keys(this.fileDump[0])
            } else {
                this.server.connect((doc: DumpDocument) => {
                    this.schema = doc.schema;
                    this.fileDump = doc.rows;
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
