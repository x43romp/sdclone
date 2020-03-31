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
}
