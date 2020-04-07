import { HashData, HashVerifyOptions } from '../hash'
import { parse, join } from 'path'
import { existsSync } from 'fs'

export default class HashTemplate {
  public EXTENSIONS: string[] = []

  public async hash(filepath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!filepath) reject(filepath)
      resolve(filepath)
    })
  }

  public async print(filepath: string, quiet = false): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!filepath) reject(filepath)
      if (quiet) resolve('')
      resolve(filepath)
    })
  }

  public seal(data: HashData[] | HashData): string {
    data = (Array.isArray(data)) ? data : [data]
    const lines: string[] = data.map(line => {
      return `${line.hash}  ${line.file}`
    })
    return lines.join('\n')
  }

  public parser(data: string): HashData[] {
    while (data.includes('  '))
      data = data.replace('  ', ' ')

    const lines: HashData[] = data.split('\n').map(line => {
      const segments = line.split(' ')
      const hash: string = segments.shift() as string
      const filename: string = segments.join(' ')
      return { hash: hash, file: filename }
    }).filter(line => {
      return (line.file)
    })

    return lines
  }

  public async verify(filepath: string, data: string, opts?: HashVerifyOptions): Promise<string> {
    const directory = parse(filepath).dir

    const lines: HashData[] = this.parser(data)

    let passCount = 0
    let failCount = 0
    let missCount = 0

    let response: string[] = await Promise.all(lines.map(async line => {
      const fileExist = existsSync(join(directory, line.file))
      let lineResp = ''
      if (fileExist) {
        const hash: string = await this.hash(join(directory, line.file))
        lineResp = `${hash} | ${line.hash} | ${line.file}`

        if (hash !== line.hash) {
          failCount++
          lineResp = `- | ${lineResp}`
        } else if (hash === line.hash) {
          passCount++
          lineResp = `+ | ${lineResp}`
        }
      } else {
        missCount++
        lineResp = `x | ${line.hash} | ${line.file}`
      }
      return lineResp
    }))
    if (opts?.quiet) response = []
    response.push(`pass ${passCount}`)
    if (failCount > 0)
      response.push(`fail ${failCount}`)
    if (missCount > 0)
      response.push(`missing ${missCount}`)

    return response.join('\n')
  }
}
