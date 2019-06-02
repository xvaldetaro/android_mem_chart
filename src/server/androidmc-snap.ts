import {ServerLoop} from './ServerLoop';
import program from 'commander';
import {AdbShellDumper} from './AdbShellDumper';
import {FileSaveLoop} from './FileSaveLoop';

program
    .arguments('<process> <file> [tag]')
    .option('-r, --raw', 'Use raw values (not Summary) from meminfo')
    .parse(process.argv);

const args = program.args;
if (args.length < 1 ||  args.length > 3) {
    console.log('Usage: serve <process.name>\nex: androidmc com.company.build.flavor\nyou can find all process ' +
        'name by calling \'adb shell dumpsys meminfo\'');
    process.exit(1)
}

const file = args[1];
const tag = args[2];
const shell = new AdbShellDumper(args[0], program.raw);
const fileSave = new FileSaveLoop(file, shell.getSingleDump());
fileSave.takeSnapshot(tag);

