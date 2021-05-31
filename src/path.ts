import { readdirSync, Stats, statSync } from "fs"
import { isAbsolute, join, normalize } from "path"
import { pathToFileURL } from "url"

/**
 * get the absolute path
 * @param path {string} path to check
 * @returns {string} direct path as a string
 */
export function directPath(path: string): string {

    // determine filesystem
    const isPOSIX: boolean = process.platform !== "win32"
    const trails: string[] = isPOSIX ? ['/'] : ['\\']

    // clean path
    path = path.trim()

    // removes trailing slashes
    while (trails.includes(path.substr(-1)) && path.length > 1)
        path = path.slice(0, -1)

    return isAbsolute(path)
        ? normalize(path)               // return normalized path
        : join(process.cwd(), path)     // join with current directory
}

export interface ScanDirectoryConfig {
    recursive?: boolean;
    fullpath?: boolean;
}
/**
 * scans a directory and returns all files
 * @param directory {string} path to the directory
 * @param config {ScanDirectoryConfig} configuration
 * @returns {string[]} string array of all files
 */
export function scanDirectory(
    directory: string,
    config: ScanDirectoryConfig = { recursive: false, fullpath: false })
    : string[] {

    // determine filesystem
    const isPOSIX: boolean = process.platform !== "win32"

    // clean directory
    directory = directPath(directory)

    // get list of files
    const rawFiles: string[] = readdirSync(directory)

    const files: string[] = rawFiles.reduce((acc, path) => {

        // get file path
        const relativePath = join(directory, path)

        // display path
        const returnPath = (config.fullpath) ? join(directory, path) : path

        // get path statistics
        const stats: Stats = statSync(relativePath)

        if (stats.isFile()) {
            // return the current path

            // return file
            acc.push(path)
        } else if (stats.isDirectory() && config.recursive == true) {
            // return the subfiles

            // scan the subdirectory
            scanDirectory(relativePath, { fullpath: false, recursive: true })
                // join the current path and subfile
                .map(sub => join(path, sub))
                // return subfile
                .forEach(sub => acc.push(sub))
        }

        return acc
    }, [] as string[])

    return (config.fullpath === true)
        ? files.map(path => join(directory, path))  // return with base directory
        : files                                     // return base lsit
}