import { join } from 'path/posix'
import { directPath, getFiles, getFilesProps, getHostname, getName, getUsername } from '../lib'

// directPath() tests
describe('system - directPath()', () => {
    let needle: string = join(process.cwd(), 'src')

    test(`subpath: src`, () => {
        const path: string = directPath('src')
        expect(path).toBe(needle)
    })
    test(`subfile: ./src`, () => {
        const path: string = directPath('./src')
        expect(path).toBe(needle)
    })
    test(`direct: /src`, () => {
        const path: string = directPath('/src')
        const needle: string = '/src'
        expect(path).toBe(needle)
    })
})

// getFiles() tests
describe('system - getFiles()', () => {
    let config: getFilesProps
    let needle: string = 'package.json'

    beforeEach(() => {
        config = {
            recursive: false,
            fullpath: false,
            ignore: ['.git'],
            ignExt: [],
        }
    })

    test(`default operations`, () => {
        const files: string[] = getFiles('.', config)
        expect(files).toContain(needle)
    })

    test(`fullpath`, () => {
        config = { ...config, fullpath: true }
        const files: string[] = getFiles('.', config)
        const needle: string = join(process.cwd(), 'package.json')
        expect(files).toContain(needle)
    })

    test(`ignore`, () => {
        config = { ...config, ignore: ['package.json'] }
        const files: string[] = getFiles('.', config)
        expect(files).not.toContain(needle)
    })

    test(`ignore in fullpath`, () => {
        config = { ...config, fullpath: true, ignore: ['package.json'] }
        const files: string[] = getFiles('.', config)
        const needle: string = join(process.cwd(), 'package.json')
        expect(files).not.toContain(needle)
    })

    test(`subdirectory : src`, () => {
        const files: string[] = getFiles('src')
        expect(files).not.toContain(needle)
    })

    test(`subdirectory : ./src`, () => {
        const files: string[] = getFiles('./src')
        expect(files).not.toContain(needle)
    })

    test(`recursive`, () => {
        const filesA: string[] = getFiles('node_modules', config)
        const filesB: string[] = getFiles('node_modules', { ...config, recursive: true })
        expect(filesA.length).toBeLessThanOrEqual(filesB.length)
    })

    test(`recursive part 2`, () => {
        config = { ...config, recursive: true }
        const filesA: string[] = getFiles('.', config)
        const filesB: string[] = getFiles('node_modules', { recursive: true })
        expect(filesA.length).toBeGreaterThanOrEqual(filesB.length)
    })

    test(`ignore in recursive`, async () => {
        config = { ...config, recursive: true }
        const filesA: string[] = getFiles('.', config)
        const filesB: string[] = getFiles('.', { ...config, ignore: ['node_modules', '.git'] })
        expect(filesA.length).toBeGreaterThan(filesB.length)
    })

    test.todo(`ignore works with regex`)
})

describe('system - creatorinfo methods', () => {
    let config = {
        name: '',
        username: '',
        hostname: '',
    }

    beforeAll(() => {
        config = require('./system.config.json')
    })

    test('getName()', () => {
        const name: string = getName()
        expect(name).toEqual(config['name'])
    })

    test('getUsername()', () => {
        const username: string = getUsername()
        expect(username).toEqual(config['username'])
    })

    test('getHostname()', () => {
        const hostname: string = getHostname()
        expect(hostname).toEqual(config['hostname'])
    })
})
