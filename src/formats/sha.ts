import HashTemplate from './_template'
import { directPath } from '../hash'
import { statSync, createReadStream } from 'fs'
import { createHash } from 'crypto'

export default class HashSHA extends HashTemplate {
  EXTENSIONS = ['sha1', 'sha']

  public async hash(filepath: string): Promise<string> {
    const path = directPath(filepath)
    if (statSync(path).isFile() === false) throw new Error('Not a valid file')

    return new Promise((resolve, reject) => {
      try {
        const hash = createHash('sha1').setEncoding('hex')
        const read = createReadStream(path)

        read.pipe(hash)

        read.on('end', () => {
          resolve(hash.read())
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  public async print(filepath: string, quiet = false): Promise<string> {
    const hash = await this.hash(filepath)

    const output: string = (quiet) ? hash : `${hash}  ${filepath}`
    return output
  }
}
