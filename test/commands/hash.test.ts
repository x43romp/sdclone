import { expect, test } from '@oclif/test'

describe('hash', () => {
  test.stdout()
    .command(['hash'])
    .it('runs hash', ctx => {
      expect(ctx.stdout).to.contain('please provide a file')
    })

  test.stdout()
    .command(['hash', 'package.json'])
    .it('runs hash package.json', ctx => {
      expect(ctx.stdout).to.contain('package.json')
    })

  test.stdout()
    .command(['hash', 'package.json', '-q'])
    .it('runs hash package.json -q', ctx => {
      expect(ctx.stdout).to.not.contain('package.json')
    })

  // test.stdout().command('sdclone -q --format=sha package.json')
  test.stdout().command(['hash', 'package.json', '-q', '--format', 'sha'])
    .it('runs hash package.json -q --format=sha', ctx => {
      expect(ctx.stdout.length).to.equals(41)
    })
})
