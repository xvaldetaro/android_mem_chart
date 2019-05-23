import bootstrap, {Options} from './loop';

import comm from 'commander';

let processName;
comm
    .version('0.1.0')
    .arguments('<process>')
    .option('-d, --dump-json <jsonFile>', 'Record Dump to JSON')
    .option('-j, --just-server', 'Do not launch browser')
    .option('-f, --file <path>', 'Renders from JSON file dump instead of real-time dumpsys dump')
    .option('-o, --dev', 'Point to webpacks dev server')
    .option('-r, --raw', 'Use raw values (not Summary) from meminfo')
    .action((processArg: any) => {
        processName = processArg
    })
    .parse(process.argv);

if (!processName) {
    console.log('Usage: androidmc <process.name>\nex: androidmc com.company.build.flavor\nyou can find all process ' +
        'name by calling \'adb shell dumpsys meminfo\'');
    process.exit(1)
} else {
    bootstrap(processName, comm as unknown as Options)
}
