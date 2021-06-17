import { execSync } from 'child_process'
import { readdirSync, Stats, statSync } from 'fs'
import { isAbsolute, join, normalize } from 'path'
import { extname } from 'path/posix'

/**
 * determine if the current operating system is unix/linux or windows
 * @returns {boolean} is unix/linux
 */
export function isPOSIX(): boolean {
    return process.platform !== 'win32'
}

/**
 * @param {string} path - link to path
 * @returns {string} returns the direct path to the file
 */
export function directPath(path: string): string {
    // clean path
    path = path.trim()

    // get filesystem info
    const trails: string[] = isPOSIX() // based on os
        ? ['/'] // unix / linux
        : ['\\'] // windows

    // remove trailing slashes
    while (trails.includes(path.substr(-1)) && path.length > 1) path = path.slice(0, -1)

    return isAbsolute(path) //
        ? normalize(path) // sends normalized path
        : join(process.cwd(), path) // joins current directory
}

export interface getFilesProps {
    recursive?: boolean
    fullpath?: boolean
    ignore?: string[]
    ignExt?: string[]
}

/**
 * gets a list of files from a directory
 * @param {string} directory path to the directory
 * @param {getFilesProps} config configuration
 * @returns {string[]}
 */
export function getFiles(
    directory: string,
    config: getFilesProps = {
        recursive: false,
        fullpath: false,
        ignore: [],
        ignExt: [],
    }
): string[] {
    //prepare ignore files
    config.ignore = config.ignore?.map((data) => data.toLowerCase())
    config.ignExt = config.ignExt?.map((data) => data.toLowerCase())

    // get direct path
    directory = directPath(directory)

    // get list of files
    const files: string[] = readdirSync(directory).reduce((acc, path) => {
        // relative path
        const pathRel = join(directory, path)

        const pathStats: Stats = statSync(pathRel)

        if (pathStats.isFile()) {
            // check ignore files
            for (;;) {
                // ignore if in ignore list
                if (config.ignore?.includes(path.toLowerCase()) == true) break

                // ignore if in ignore extension list
                if (config.ignExt?.includes(extname(path).toLowerCase()) == true) break

                // push to list
                acc.push(path)
                break
            }
        } else if (pathStats.isDirectory() && config.recursive == true) {
            // return the subfiles

            if (config.ignore?.includes(path.toLowerCase()) != true) {
                // scan the subdirectory
                const subConfig: getFilesProps = { ...config, fullpath: false }
                getFiles(pathRel, subConfig)
                    // join the current path and subfile
                    .map((sub) => join(path, sub))
                    // return subfile
                    .forEach((sub) => acc.push(sub))
            }
        }

        return acc
    }, [] as string[])

    return config.fullpath === true //
        ? files.map((path) => join(directory, path)) // return with base directory
        : files // return base list
}

/**
 * @returns {string} system user (i.e. John Smith)
 */
export function getName(): string {
    const stdout: string = execSync('/usr/bin/id -F').toString().trim()
    return stdout
}

/**
 * @returns {string} system username (i.e. johnsmith)
 */
export function getUsername(): string {
    const stdout: string = execSync('/usr/bin/id -un').toString().trim()
    return stdout
}

/**
 *
 * @returns {string} system hostname {i.e. johnsmith-mbp.lan}
 */
export function getHostname(): string {
    const stdout: string = execSync('/bin/hostname').toString().trim()
    return stdout
}
