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

export async function seal(directory: string, opts?: HashSealOptions): Promise<string> {
  // set defaults
  if (!opts) opts = { dry: false, quiet: false, format: 'md5', encode: 'md5' }
  if (!opts?.dry) opts.dry = false
  if (!opts?.quiet) opts.quiet = false
  if (!opts?.format && !opts?.encode) opts.format = 'md5'
  if (!opts?.format && opts.encode) opts.format = opts.encode
  if (!opts?.encode) opts.encode = opts.format

  const FormatClass = loadHash(opts.format)
  const EncodeClass = loadHash(opts.encode)

  const formatClass = new FormatClass() as HashTemplate
  const encodeClass = new EncodeClass() as HashTemplate

  const files = scanDir(directory, { recursive: true, fullpath: false })
  const data: HashData[] = await Promise.all(files.map(async file => {
    const filepath = directPath(join(directory, file))
    const filehash = await encodeClass.hash(filepath)
    const filestat: Stats = await statSync(filepath)
    const filedata: HashData = {
      file: file,
      hash: filehash,
      size: filestat.size,
      hashdate: new Date().toISOString(),
      lastmodificationdate: filestat.mtime.toISOString(),
    }
    return filedata
  }))

  const writeData = encodeClass.seal(data)
  let filename: string

  if (opts.output) {
    filename = opts.output
  } else {
    const dirname = parse(directPath(directory)).name
    const dirdate = new Date().toISOString().split('.')[0].split(':').join('').split('T').join('_')
    filename = join(directPath(directory), `${dirname}_${dirdate}.${formatClass.EXTENSIONS[0]}`)
  }

  if (opts.dry === false) {
    writeFile(filename, writeData, err => {
      if (err) throw (err.message)
    })
  }

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
