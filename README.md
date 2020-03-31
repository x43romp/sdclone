sdclone
=======

Shadow Clone -- automated copy and hash system

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/sdclone.svg)](https://npmjs.org/package/sdclone)
[![Downloads/week](https://img.shields.io/npm/dw/sdclone.svg)](https://npmjs.org/package/sdclone)
[![License](https://img.shields.io/npm/l/sdclone.svg)](https://github.com/x43romp/sdclone/blob/master/package.json)

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
sdclone/0.0.0 darwin-x64 node-v12.16.1
$ sdclone --help [COMMAND]
USAGE
  $ sdclone COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`sdclone hello [FILE]`](#sdclone-hello-file)
* [`sdclone help [COMMAND]`](#sdclone-help-command)

## `sdclone hello [FILE]`

describe the command here

```
USAGE
  $ sdclone hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ sdclone hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/x43romp/sdclone/blob/v0.0.0/src/commands/hello.ts)_

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
<!-- commandsstop -->
