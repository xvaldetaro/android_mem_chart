import {ServerLoop} from './ServerLoop';
import program from 'commander';
import {AdbShellDumper} from './AdbShellDumper';

program
    .arguments('<process> , Find all process names by calling \'adb shell dumpsys meminfo\'')
    .option('-l, --launch-browser', 'Launch browser automatically')
    .option('-r, --raw', 'Use raw values (not Summary) from meminfo')
    .option('-d, --dev', 'starts a dev websocket server only for dev')
    .option('-f, --from-file <file>', 'Loads from file instead of Realtime pulling')
    .option('-i, --interval', 'Interval between dumps in seconds')
    .parse(process.argv);

const args = program.args;
if (args.length !== 1) {
    console.log('Usage: serve <process.name>\nex: androidmc com.company.build.flavor\nyou can find all process ' +
        'name by calling \'adb shell dumpsys meminfo\'');
    process.exit(1)
}

const shell = new AdbShellDumper(args[0], program.raw, program.interval);
const server = new ServerLoop(program.launchBrowser, program.dev, program.raw, shell.getPeriodicDump(),
    program.fromFile);
server.launch();

