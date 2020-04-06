import HashTemplate from './_template';
import { HashData, HashVerifyOptions } from '../hash';
import HashMD5 from './md5';

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
    return super.seal(data)
  }

  public async verify(filepath: string, data: string, opts?: HashVerifyOptions): Promise<string> {
    return ''
  }
}

