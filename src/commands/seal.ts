import { Command, flags } from '@oclif/command'
import { seal, HashSealOptions } from '../hash'

export default class Seal extends Command {
  static description = 'creates a hash file for a directory'

  static flags = {
    help: flags.help({ char: 'h' }),
    output: flags.string({ char: 'o', description: 'output file name' }),
    quiet: flags.boolean({ char: 'q', description: 'suppress output' }),
    encode: flags.string({ description: 'encoding format : md5 | sha' }),
    format: flags.string({ description: 'formatting style : md5 | sha | mhl' }),
    dry: flags.boolean({ char: 'd', description: 'run without saving', default: false }),
  }

  static args = [{ name: 'path' }]

  async run() {
    const { args, flags } = this.parse(Seal)
    const path = args.path
    const opts: HashSealOptions = {
      dry: flags.dry,
      encode: flags.encode,
      format: flags.format,
      output: flags.output,
      quiet: flags.quiet,
    }
    if (path) {
      const out: string = await seal(path, opts)
      if (opts.quiet === false)
        this.log(out)
    } else {
      this.log('please provide a directory path')
    }
  }
}
