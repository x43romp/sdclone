import HashTemplate from './_template'
import { directPath } from '../hash'
import { statSync } from 'fs'
import { exec } from 'child_process'
import { cwd } from 'process'

export default class HashMD5 extends HashTemplate {
  EXTENSIONS = ['md5']

  public async hash(filepath: string): Promise<string> {
    const path = directPath(filepath)
    if (statSync(path).isFile() === false) throw new Error(`Not a valid file: ${filepath} ${cwd()}`)

    const prepared = path.replace(' ', '\\ ')
    return new Promise((resolve, reject) => {
      exec(`md5sum ${prepared}`, (error, stdout, stderr) => {
        if (error) reject(error)
        if (stderr) reject(stderr.toString())

        const split = stdout.split(' ')[0]
        if (stdout) resolve(split)
      })
    })
  }

  public async print(filepath: string, quiet = false): Promise<string> {
    const hash = await this.hash(filepath)

    const output: string = (quiet) ? hash : `${hash}  ${filepath}`
    return output
  }
}
