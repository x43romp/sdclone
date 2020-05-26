import { join, normalize, isAbsolute, parse } from 'path'
import HashTemplate from './formats/_template'
import { readdirSync, statSync, Stats, writeFile, readFileSync, existsSync } from 'fs'

export enum ERRORS {
  'HASH_ERROR_NOTFOUND' = 'ERROR: cannot find format'
}

export type FORMATS = 'md5'

export function directPath(path: string) {
  path = path.trim()
  while (['\\', '/', '"'].includes(path.substr(-1)) && path.length > 1) {
    path = path.slice(0, -1)
  }
  return isAbsolute(path) ? normalize(path) : join(process.cwd(), path)
}

function hashPath(format: FORMATS | string = 'md5') {
  const directory = './formats'
  const path = `${directory}/${format}.ts`
  const pathLocal = join(__dirname, path)
  const pathExist = existsSync(pathLocal)

  if (pathExist === false) return false
  return path
}

function loadHash(format: FORMATS | string = 'md5') {
  const path = hashPath(format)
  if (path === false) return false

  const hashClass = require(path).default
  return hashClass
}

export interface ScandirOptions {
  recursive?: boolean;
  fullpath?: boolean;
}

export function scanDir(dirpath: string, { recursive = false, fullpath = false }: ScandirOptions = {}) {
  dirpath = directPath(dirpath)

  const data = readdirSync(dirpath)

  const files: string[] = data.reduce((acc, file) => {
    const filepath = join(dirpath, file)
    const stats: Stats = statSync(filepath)
    file = (fullpath) ? join(dirpath, file) : file
    const blank: string[] = []

    if (stats.isFile()) {
      acc.push(file)
    } else if (stats.isDirectory()) {
      const subfiles = scanDir(filepath, { recursive: recursive, fullpath: fullpath }) //
        .map(sub => join(file, sub)) //
        .forEach(sub => acc.push(file))
    }

    return acc
  }, [] as string[])

  return files
}

export function hash(filepath: string, format: FORMATS = 'md5'): Promise<string> {
  const HashClass = loadHash(format)
  const hash = new HashClass() as HashTemplate
  return hash.hash(filepath)
}

export function print(filepath: string, quiet = false, format: FORMATS | string = 'md5'): Promise<string> {
  const HashClass = loadHash(format)
  const hash = new HashClass() as HashTemplate
  return hash.print(filepath, quiet)
}

export async function seal(directory: string, { //
  dry = false, quiet = false, format = 'md5', //
  encode = undefined, output = undefined }: HashSealOptions = {}) {

  // set default encode
  encode = (encode) ? encode : format

  const FormatClass = loadHash(format)
  const EncodeClass = loadHash(encode)

  const formatClass = new FormatClass() as HashTemplate
  const encodeClass = new EncodeClass() as HashTemplate

  const files = scanDir(directory, { recursive: true, fullpath: false })
  const data: HashData[] = await Promise.all(files.map(async file => {
    const filepath = directPath(join(directory, file))
    const filestat: Stats = await statSync(filepath)
    const filehash = await encodeClass.hash(filepath)
    const filedata: HashData = {
      file: file,
      hash: filehash,
      size: filestat.size,
      lastmodificationdate: filestat.mtime.toISOString(),
      hashdate: new Date().toISOString(),
    }
    return filedata
  }))

  const writeData = encodeClass.seal(data)
  const filename = (output !== undefined) ? output : //
    `${parse(directPath(directory)).name}_${ //
    new Date().toISOString().split('.')[0].replace(/:/g, '').replace('T', '_')}.${ //
    formatClass.EXTENSIONS[0]}`

  if (dry) return writeData

  writeFile(filename, writeData, error => {
    if (error) throw (error.message)
  })

  return writeData
}

export interface HashSealOptions {
  dry?: boolean;
  encode?: string | FORMATS;
  format?: string | FORMATS;
  output?: string;
  quiet?: boolean;
}

export interface HashData {
  file: string;
  hash: string;
  size?: number;
  lastmodificationdate?: string;
  hashdate?: string;
}

export interface HashVerifyOptions {
  quiet?: boolean;
}

export async function verify(filepath: string, opts?: HashVerifyOptions): Promise<string> {
  if (!opts) opts = { quiet: false }
  if (opts?.quiet === null) opts.quiet = false

  const extension = parse(filepath).ext.replace('.', '')

  if (extension === '' || extension === undefined)
    return 'invalid format'

  const FormatClass = loadHash(extension)
  if (FormatClass === false) return 'invalid format'
  const formatClass = new FormatClass() as HashTemplate

  if (existsSync(directPath(filepath)) === false) return `cannot find file ${filepath}`

  const data = await readFileSync(directPath(filepath)).toString()
  const response = await formatClass.verify(filepath, data, opts)

  return response
}
