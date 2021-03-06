sdclone
=======

Shadow Clone -- automated copy and hash system

![NPM Test](https://github.com/x43romp/sdclone/workflows/NPM%20Test/badge.svg)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
<!-- [![Version](https://img.shields.io/npm/v/sdclone.svg)](https://npmjs.org/package/sdclone)
[![Downloads/week](https://img.shields.io/npm/dw/sdclone.svg)](https://npmjs.org/package/sdclone)
[![License](https://img.shields.io/npm/l/sdclone.svg)](https://github.com/x43romp/sdclone/blob/master/package.json) -->

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g sdclone
$ sdclone COMMAND
running command...
$ sdclone (-v|--version|version)
sdclone/0.2.1 darwin-x64 node-v12.16.1
$ sdclone --help [COMMAND]
USAGE
  $ sdclone COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`sdclone hash [FILEPATH]`](#sdclone-hash-filepath)
* [`sdclone help [COMMAND]`](#sdclone-help-command)
* [`sdclone seal [PATH]`](#sdclone-seal-path)
* [`sdclone verify [FILE]`](#sdclone-verify-file)

## `sdclone hash [FILEPATH]`

describe the command here

```
USAGE
  $ sdclone hash [FILEPATH]

OPTIONS
  -h, --help       show CLI help
  -q, --quiet      print only the hash
  --format=format  [default: md5] hash type
```

_See code: [lib/commands/hash.js](https://github.com/x43romp/sdclone/blob/v0.2.1/lib/commands/hash.js)_

## `sdclone help [COMMAND]`

display help for sdclone

```
USAGE
  $ sdclone help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `sdclone seal [PATH]`

creates a hash file for a directory

```
USAGE
  $ sdclone seal [PATH]

OPTIONS
  -d, --dry            run without saving
  -h, --help           show CLI help
  -o, --output=output  output file name
  -q, --quiet          suppress output
  --encode=encode      encoding format : md5 | sha
  --format=format      formatting style : md5 | sha | mhl
```

_See code: [lib/commands/seal.js](https://github.com/x43romp/sdclone/blob/v0.2.1/lib/commands/seal.js)_

## `sdclone verify [FILE]`

verifies a hashfile

```
USAGE
  $ sdclone verify [FILE]

OPTIONS
  -h, --help   show CLI help
  -q, --quiet  only show pass/fail/missing
```

_See code: [lib/commands/verify.js](https://github.com/x43romp/sdclone/blob/v0.2.1/lib/commands/verify.js)_
<!-- commandsstop -->
