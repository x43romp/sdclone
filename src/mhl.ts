import { Stats, statSync } from 'fs'
import { basename, join } from 'path/posix'
import { directPath, getFiles, getFilesProps, toISOString } from './system'

export interface MhlBase {
    file: string
    size?: number
    lastmodificationdate?: string | Date
    hashdate?: string | Date
}

export class Mhl<T extends MhlBase> {
    private _db: Record<string, T> = {}
    static configOpenDirectory: getFilesProps = {
        recursive: true,
        fullpath: false,
        ignExt: ['.mhl'],
    }

    public get(file: string): T {
        return this._db[file] as T
    }

    static getInfo(filePath: string, file?: string): MhlBase {
        const fileStat: Stats = statSync(filePath)
        const fileDate: string = toISOString(fileStat.mtime || new Date())
        const info: MhlBase = {
            file: file || basename(filePath),
            size: fileStat.size || 0,
            lastmodificationdate: fileDate,
            hashdate: fileDate,
        }
        return info
    }

    public openDirectory(directory: string): void {
        // get path
        directory = directPath(directory)

        // get the files
        const data: Record<string, MhlBase> = Mhl.openDirectory(directory)

        // put data into database
        for (const file in data) {
            this._db[file] = data[file] as T
        }
    }

    static openDirectory(directory: string): Record<string, MhlBase> {
        // record
        const db: Record<string, MhlBase> = {}

        // get path
        directory = directPath(directory)

        // get files
        const fileList: string[] = getFiles(directory, Mhl.configOpenDirectory)
        for (const file of fileList) {
            const filePath: string = join(directory, file)
            const info: MhlBase = this.getInfo(filePath, file)
            db[file] = info
        }
        return db
    }
}
