import { Command, flags } from '@oclif/command'
import { copy } from '../hash'

export default class Copy extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'name to print' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }

  static args = [
    { name: 'path', description: 'file or directory path to copy', required: true },
    { name: 'destination', description: 'path where to copy to', required: true }
  ]

  async run() {
    const { args, flags } = this.parse(Copy)

    const path = args.path
    const dest = args.destination

    copy(path, { dest: dest }, (data, err) => {
      if(err) throw err
      console.log(data)
    })
    // const name = flags.name || 'world'
    // this.log(`hello ${name} from /Users/romp/repo/sdclone/src/commands/copy.ts`)
    // if (args.file && flags.force) {
    //   this.log(`you input --force and --file: ${args.file}`)
    // }
  }
}
