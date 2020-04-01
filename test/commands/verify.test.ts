import { expect, test } from '@oclif/test'

describe('verify', () => {
  test.stdout()
    .command(['verify'])
    .it('runs verify', ctx => {
      expect(ctx.stdout).to.contain('please enter a filepath')
    })

  test.stdout()
    .command(['verify', 'invalidfile.md5'])
    .it('runs verify notvalidifle.md5', ctx => {
      expect(ctx.stdout).to.contain('cannot find file')
    })

  test.stdout()
    .command(['verify', 'package.json'])
    .it('runs verify with invalid extension', ctx => {
      expect(ctx.stdout).to.contain('invalid')
    })
})
