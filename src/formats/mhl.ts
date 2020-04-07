import HashTemplate from './_template'
import { HashData, HashVerifyOptions } from '../hash'
import HashMD5 from './md5'
import * as OS from 'os'
import { js2xml } from 'xml-js'

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
    return ''
  }
}

