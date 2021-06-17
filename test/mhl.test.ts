import { Stats, statSync } from 'fs'
import { join } from 'path'
import { directPath, Mhl, MhlBase, toISOString } from '../lib'

describe('MhlDatabase static', () => {
    test('getInfo', () => {
        const target: Stats = statSync('package.json')
        const filePath = directPath(join(process.cwd(), 'package.json'))
        const info: MhlBase = Mhl.getInfo(filePath)
        expect(info.size).toBe(target.size)
        expect(info.lastmodificationdate).toBe(toISOString(target.mtimeMs))
    })
    test('openDirectory', () => {
        const files: Record<string, MhlBase> = Mhl.openDirectory('.')
        const file: MhlBase = files['package.json']
        const target: Stats = statSync('package.json')
        expect(file.size).toBe(target.size)
        expect(file.lastmodificationdate).toBe(toISOString(target.mtime))
    })
})

describe('MhlDatabase class', () => {
    let mhl: Mhl<MhlBase>
    beforeEach(() => {
        mhl = new Mhl()
    })
    test('openDirectory', () => {
        mhl.openDirectory('.')
        const file: MhlBase = mhl.get('package.json')
        const target: Stats = statSync('package.json')
        expect(file.size).toBe(target.size)
        expect(file.lastmodificationdate).toBe(toISOString(target.mtime))
    })
})
