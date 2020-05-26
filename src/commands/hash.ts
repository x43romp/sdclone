import { Command, flags } from '@oclif/command'
import { print } from '../hash'

export default class Hash extends Command {
  static description = 'get the hash value of a file'

  static flags = {
    help: flags.help({ char: 'h' }),
    quiet: flags.boolean({ char: 'q', description: 'print only the hash', default: false }),
    format: flags.string({ description: 'hash type', default: 'md5' }),
  }

  static args = [{ name: 'filepath' }]

  async run() {
    const { args, flags } = this.parse(Hash)
    const filepath = args.filepath
    const quiet = flags.quiet
    const format = flags.format

    if (filepath)
      this.log(await print(filepath, quiet, format))
    else
      this.log('please provide a file')
  }
}
