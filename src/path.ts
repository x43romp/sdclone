import { isAbsolute, join, normalize } from "path"

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
