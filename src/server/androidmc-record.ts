import {ServerLoop} from './ServerLoop';
import program from 'commander';
import {AdbShellLoop} from './AdbShellLoop';
import {FileSaveLoop} from './FileSaveLoop';

program
    .arguments('<process> <file>')
    .option('-i, --interval', 'Interval between dumps in seconds')
    .option('-r, --raw', 'Use raw values (not Summary) from meminfo')
    .parse(process.argv);

const args = program.args;
if (args.length < 1 ||  args.length > 3) {
    console.log('Usage: serve <process.name>\nex: androidmc com.company.build.flavor\nyou can find all process ' +
        'name by calling \'adb shell dumpsys meminfo\'');
    process.exit(1)
}

const file = args[1];
const shell = new AdbShellLoop(args[0], program.raw, program.interval);
const fileSave = new FileSaveLoop(file, shell.getPeriodicDump());
fileSave.launch();

