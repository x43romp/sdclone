#!/usr/bin/env node
import { join, parse } from 'path';
import { expectFile, directPath, scandir, printProgressOptions, printProgress, expectDir } from './sdTools';
import { Hash, HashProgress } from './sdHash';

import program = require('commander');
import readline = require('readline');

program
    .version('0.0.1')
    .description('Shadow Clone -- Automated file checksum');


// Seal command
program
    .command('seal <path>')
    .description('seals a directory')
    .action(async (path, options) => {
        try {
            // Fill unassigned options will defaults
            let optionsDefs = { interval: 500 };
            options = Object.assign(optionsDefs, options);

            // fix path
            path = directPath(path);
            console.log(`=====\nSealing [ ${path} ]\n=====`);

            // record time start
            let time = process.hrtime();

            // get list of files
            let files: string[] = [];
            if (expectDir(path)) files = scandir(path);
            else if (expectFile(path)) { files = [parse(path).base]; path = parse(path).dir; }
            else throw `not a valid path: ${path}`;

            let filecounter = 0;
            for (let file of files) {
                filecounter++;

                // get the full filepath and initalize Hash
                let filepath = join(path, file);
                let hash = new Hash(filepath);

                // configure printProgress options
                const progressOpts: printProgressOptions = {
                    index: filecounter, indexTotal: files.length,
                    progressTotal: hash.filesize, progressLength: 32,
                    progressDone: null,
                }

                await hash.stream({ interval: options.interval }, (data: HashProgress, error) => {
                    readline.clearLine(process.stdout, 0);
                    readline.cursorTo(process.stdout, 0, null);
                    progressOpts.progress = data.sizeread;
                    process.stdout.write(printProgress(file, progressOpts));
                }).then((data) => {
                    readline.clearLine(process.stdout, 0);
                    readline.cursorTo(process.stdout, 0);
                    progressOpts.progressDone = data.hash;
                    console.log(printProgress(file, progressOpts));
                });
            }

            time = process.hrtime(time);

            // console.log(`This process took ${process.hrtime(time)[0]} seconds`);
            console.log(`=====\nThis process took ${ (time[0] + time[1] / 1e9).toFixed(3) } seconds\n=====`);


        } catch (error) {
            console.error(error);
        }

    });

program.parse(process.argv)
