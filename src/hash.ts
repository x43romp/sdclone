import { join, normalize, isAbsolute } from 'path'
import HashTemplate from './formats/_template'

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
