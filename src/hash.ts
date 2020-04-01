import { join, normalize, isAbsolute, parse } from 'path'
import HashTemplate from './formats/_template'
import { readdirSync, statSync, Stats, writeFile } from 'fs'

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
  return `${directory}/${format}.ts`
}

function loadHash(format: FORMATS | string = 'md5') {
  const hashClass = require(hashPath(format)).default
  return hashClass
}

export interface ScandirOptions {
  recursive?: boolean;
  fullpath?: boolean;
}

export function scanDir(dirpath: string, opts?: ScandirOptions): string[] {
  dirpath = directPath(dirpath)

  let files: string[] = []
  const data = readdirSync(dirpath)

  for (const file of data) {
    const filepath = join(dirpath, file)
    const stats: Stats = statSync(filepath)

    if (stats.isFile()) {
      // if file
      files.push(file)
    } else if (stats.isDirectory() && opts?.recursive === true) {
      // if directory
      // if recursive
      const subfiles = scanDir(filepath, { recursive: opts?.recursive, fullpath: false })
        .map(sub => join(file, sub))

      files = files.concat(subfiles)
    }
  }

  if (opts?.fullpath)
    files = files.map(file => join(dirpath, file))

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
  if (!opts?.format) opts.format = 'md5'
  if (!opts?.encode) opts.encode = opts.format

  const FormatClass = loadHash(opts.format)
  const EncodeClass = loadHash(opts.encode)

  const formatClass = new FormatClass() as HashTemplate
  const encodeClass = new EncodeClass() as HashTemplate

  const files = scanDir(directory, { recursive: true, fullpath: false })
  const data = await Promise.all(files.map(async file => {
    const filepath = directPath(join(directory, file))
    const filehash = await encodeClass.hash(filepath)
    return { file: file, hash: filehash }
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
      if (err) throw new Error(err.message)
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
}
