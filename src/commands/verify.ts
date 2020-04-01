import { Command, flags } from '@oclif/command'
import { verify } from '../hash'

export default class Verify extends Command {
  static description = 'verifies a hashfile'

  static flags = {
    help: flags.help({ char: 'h' }),
    quiet: flags.boolean({ char: 'q', description: 'only show pass/fail/missing', default: false }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const { args, flags } = this.parse(Verify)

    const file = args.file
    if (file) {
      const resp: string = await verify(file, { quiet: flags.quiet })
      this.log(resp)
    } else {
      this.log('please enter a filepath')
    }
  }
}
