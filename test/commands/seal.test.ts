import { expect, test } from '@oclif/test'

describe('seal', () => {
  test.stdout()
    .command(['seal', 'src', '--dry'])
    .it('runs seal src --dry', ctx => {
      expect(ctx.stdout).to.contain('index.ts')
    })

  test.stdout()
    .command(['seal', 'src', '--dry', '-q'])
    .it('runs seal src --dry -q', ctx => {
      expect(ctx.stdout).to.not.contain('index.ts')
    })
})
