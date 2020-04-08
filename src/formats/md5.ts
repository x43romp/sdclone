import HashTemplate from './_template'
import { directPath, HashData } from '../hash'
import { statSync, createReadStream, createWriteStream } from 'fs'
import { cwd } from 'process'
import { createHash } from 'crypto'

export default class HashMD5 extends HashTemplate {
  EXTENSIONS = ['md5']

  public async hash(filepath: string, destpath?: string): Promise<string> {
    const path = directPath(filepath)
    if (statSync(path).isFile() === false) throw new Error(`Not a valid file: ${filepath} ${cwd()}`)

    return new Promise((resolve, reject) => {
      try {
        const hash = createHash('md5').setEncoding('hex')
        const read = createReadStream(path)
        if (destpath) {
          const write = createWriteStream(destpath)
          read.pipe(write)
        }

        read.pipe(hash)

        read.on('end', async () => {
          const output: string = hash.read()
          if (destpath) {
            const copyhash: string = await this.hash(destpath)
            if (copyhash == output)
              resolve(output)
            else reject(`not matching ${output} + ${copyhash}`)
          } else {
            resolve(output)
          }

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

  public seal(data: HashData[] | HashData): string {
    return super.seal(data)
  }
}
