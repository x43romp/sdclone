import { isAbsolute, join, normalize } from 'path'

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
    while (trails.includes(path.substr(-1)) && path.length > 1)
        path = path.slice(0, -1)

    return isAbsolute(path) //
        ? normalize(path) // sends normalized path
        : join(process.cwd(), path) // joins current directory
}
