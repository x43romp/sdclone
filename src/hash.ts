import { join, normalize, isAbsolute, parse } from 'path'
import HashTemplate from './formats/_template'
import { readdirSync, statSync, Stats, writeFile, readFileSync, existsSync, mkdirSync } from 'fs'

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

export interface HashCopyOptions {
  dest?: string
}
export async function copy(path: string, opts?: HashCopyOptions, callback?: (data: any, err?: any) => void) {
  if (!opts?.dest) throw 'destination required'

  const fullpath = directPath(path)
  const stats = statSync(path)
  const ext = 'md5'

  if (existsSync(fullpath) === false && stats.isDirectory() === false) throw `path ${fullpath} does not exist`

  let files: string[] = []

  // generate list of files
  let directory = ''
  if (stats.isFile()) {
    directory = parse(fullpath).dir
    files = (fullpath === path) ? [parse(path).base] : [path]
  } else if (stats.isDirectory()) {
    directory = fullpath
    files = scanDir(fullpath, { fullpath: false, recursive: true })
  }
  // console.log(`dir ${directory}`)
  // console.log(files)

  // target path
  const dest = opts.dest
  const targetDir = (parse(dest).ext) ? parse(directPath(dest)).base : directPath(dest)

  mkdirSync(targetDir, { recursive: true })

  const HashClass = loadHash(ext)
  const hash = new HashClass() as HashTemplate
  files.forEach(async file => {
    // console.log(directPath(join(directory, file)))
    const a = directPath(join(directory, file))
    const b = join(targetDir, file)
    // console.log(`${a} --- ${b}`)
    const h = await hash.hash(a, b)
    if (callback) {
      callback(`${h}  ${file}`)

    }
    // if (callbck)
    //   callbck(h)
  })
  // console.log(files)
}
