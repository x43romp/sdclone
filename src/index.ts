#!/usr/bin/env node
import { join, parse } from 'path';
import { expectFile, directPath, scandir, printProgressOptions, printProgress, expectDir } from './tools';
import { Hash, HashProgress, HashInterface } from './hash';

import program = require('commander');
import readline = require('readline');
import { Archive } from './archive';

program
    .version('0.0.1')
    .description('Shadow Clone -- Automated file checksum');

// Seal command
program
    .command('seal <path>')
    .description('seals a directory')
    .action(async (path, options) => {
        let archive = new Archive(path);
        let progress: printProgressOptions = {
            index: 0, indexTotal: archive.getFiles().length,
            progressTotal: 0, progressLength: 32,
            progressDone: null
        };

        console.log(`=====\nSealing [ ${path} ]\n=====`);
        archive.stream();
        let timer = new Date().getTime();
        archive.on('data', (data: HashProgress, counter) => {
            if (new Date().getTime() < timer)
                return;

            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0, null);
            progress.index = counter;
            progress.progress = data.sizeread;
            progress.progressTotal = data.filesize;
            progress.progressDone = null;
            process.stdout.write(printProgress(data.filename, progress));

            timer = new Date().getTime() + 500;
        }).on('hash', (data: HashInterface, counter) => {
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);
            progress.index = counter;
            progress.progressDone = data.hash;
            console.log(printProgress(data.filename, progress));
        }).on('done', () => {
            let totalbytes = archive.files.reduce((acc, file) => acc + file.filesize, 0);
        });
    });

program.parse(process.argv)
