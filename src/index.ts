#!/usr/bin/env node
import program = require('commander');

program
    .version('0.0.1')
    .description('Shadow Clone -- Automated file checksum');


program.parse(process.argv)
