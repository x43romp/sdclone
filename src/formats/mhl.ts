import HashTemplate from './_template'
import { HashData, HashVerifyOptions } from '../hash'
import HashMD5 from './md5'
import * as OS from 'os'
import { js2xml, xml2js, ElementCompact } from 'xml-js'
import { parse, join } from 'path'
import { existsSync } from 'fs'

interface Mhl {
  hashlist_version: string;
  creatorinfo: MhlCreator;
  hash: MhlHash[];
}

interface MhlCreator {
  name: string;
  username: string;
  hostname: string;
  tool: string;
  startdate: string;
  finishdate: string;
}

interface MhlHash {
  file: string;
  size: number;
  lastmodificationdate: string;
  hashdate: string;
  md5?: string;
  sha?: string;
}

export default class HashMHL extends HashTemplate {
  EXTENSIONS = ['mhl']

  public async hash(filepath: string): Promise<string> {
    return new HashMD5().hash(filepath)
  }

  public seal(data: HashData[] | HashData): string {
    data = (Array.isArray(data)) ? data : [data]

    const creator: MhlCreator = {
      name: OS.userInfo().username,
      username: OS.userInfo().username,
      hostname: OS.hostname(),
      tool: `sdclone ${process.version.toString()}`,
      startdate: new Date().toISOString(),
      finishdate: new Date().toISOString(),
    }

    const lines: MhlHash[] = data.map(line => {
      const resp: MhlHash = {
        file: line.file,
        size: line.size as number,
        lastmodificationdate: line.lastmodificationdate as string,
        hashdate: line.hashdate as string,
        md5: line.hash as string,
      }
      return resp
    })

    const jsobj = {
      _declaration: {
        _attributes: {
          version: '1.0',
          encoding: 'utf-8',
        },
      },
      hashlist: {
        _attributes: {
          version: '1.0',
        },
        creatorinfo: {
          name: creator.name,
          username: creator.username,
          hostname: creator.hostname,
          tool: creator.tool,
          startdate: creator.startdate,
          finishdate: creator.finishdate,
        },
        hash: lines,
      },
    }

    const xml = js2xml(jsobj, {
      compact: true,
      indentCdata: true,
      spaces: 4,
      // indentAttributes: true
    })
    return xml
  }

  public async verify(filepath: string, data: string, opts?: HashVerifyOptions): Promise<string> {
    const directory = parse(filepath).dir

    const xml: ElementCompact = xml2js(data, {
      ignoreDeclaration: true,
      compact: true,
    })

    const hashes: HashData[] = xml.hashlist.hash.map((hash: any) => {
      const data: HashData = {
        file: hash.file._text,
        hash: hash.md5._text,
        size: hash.size._text,
        lastmodificationdate: hash.lastmodificationdate._text,
        hashdate: hash.hashdate._text,
      }
      return data
    })

    let passCount = 0
    let failCount = 0
    let missCount = 0

    let response: string[] = await Promise.all(hashes.map(async line => {
      const fileExists = existsSync(join(directory, line.file))

      if (fileExists === false) {
        missCount++
        return `x | ${line.hash} | ${line.file}`
      }

      const hash: string = await this.hash(join(directory, line.file))

      if (hash === line.hash) {
        passCount++
        return `+ | ${hash} | ${line.file}`
      }

      failCount++
      return `- | ${line.hash} | ${line.hash} | err ${hash}`
    }))

    if (opts?.quiet) response = []
    response.push(`pass ${passCount}`)
    if (failCount > 0) response.push(`fail ${failCount}`)
    if (missCount > 0) response.push(`missing ${missCount}`)

    return response.join('\n')
  }
}

