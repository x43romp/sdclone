import { join } from 'path/posix'
import { directPath } from '../src'

describe('system - directPath()', () => {
    test(`directPath('src') = ${process.cwd}/src`, () => {
        expect(directPath('src')).toBe(join(process.cwd(), 'src'))
    })
    test(`directPath('/src) != ${process.cwd()}/src`, () => {
        expect(directPath('/src')).not.toBe(join(process.cwd(), '/src'))
    })
})
