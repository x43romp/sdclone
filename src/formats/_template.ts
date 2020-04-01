import { HashData } from '../hash'

export default class HashTemplate {
  EXTENSIONS: string[] = []

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

  public async sealA(directory: string, quiet = false): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!directory) reject(directory)
      if (quiet) resolve('')
      resolve(directory)
    })
  }
}
