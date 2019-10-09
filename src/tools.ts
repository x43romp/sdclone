import { normalize, join, isAbsolute } from "path";
import { statSync, existsSync, readdirSync } from "fs";

enum sdToolErrs {
    pathVoid = "path does not exist",
    pathNotDir = "path is not a directory",
    pathNotFile = "path is not a file",

}

/**
 * Creates a direct path to the file or directory
 * @param path A path to a file or directory.
 */
export function directPath(path: string): string {
    path = path.trim();
    while (["\\", "/", "\""].includes(path.substr(-1)) && path.length > 1) { path = path.slice(0, -1); }
    return isAbsolute(path) ? normalize(path) : join(process.cwd(), path);
}
/**
 * Returns if the path is an existing directory
 * @param path A path to a file or directory.
 */
export function expectDir(path: string): boolean {
    path = directPath(path);
    if (!existsSync(path)) return false;
    if (statSync(path).isDirectory()) return true;
    return false;
}

/**
 * Returns if the path is an existing file.
 * @param path A path to a file or directory
 */
export function expectFile(path: string): boolean {
    path = directPath(path);
    if (!existsSync(path)) return false;
    if (statSync(path).isFile()) return true;
    return false;
}



export interface printProgressOptions {
    // for counting
    index?: number,
    indexTotal?: number,

    // progress
    progress?: number,
    progressTotal?: number,
    progressLength?: number,
    progressDone?: any,

}
const printProgressDefs: printProgressOptions = {
    index: -1, indexTotal: -1,
    progress: -1, progressTotal: -1,
    progressLength: 32, progressDone: 'SUCCESS!',
}
/**
 * Creates a progress bar string.
 * @param subject The identifier of the line
 * @param options See `printProgressOptions` for more details
 */
export function printProgress(subject: string, options: printProgressOptions): string {
    // load options
    options = (options) ? Object.assign(scandirDefs, options) : printProgressDefs;

    // create variables
    let output = [];
    let fill = 6;

    // create text: " 43 of 100"
    if (options.indexTotal >= 0) {
        output.push(`${options.index.toString().padStart(options.indexTotal.toString().length)} of ${options.indexTotal}`);
    }

    // create text: [######........] 43.9%
    if (options.progressDone) {
        output.push(options.progressDone);
    } else if (options.progressTotal >= 0) {
        let percent = options.progress / options.progressTotal;
        let percentText = `${(percent * 100).toFixed(1)}%`.padStart(5);
        let charDone = '\u2588', charWait = '.';
        let barLength = options.progressLength - percentText.length - 2 - 1;
        let bar = charDone.repeat(barLength * percent).padEnd(barLength, charWait);
        output.push(`[${bar}] ${percentText}`);
    } else {
        output.push(`Processing`.padEnd(options.progressLength, '.'));
    }

    output.push('|', subject);

    return output.join(' ');
}

export interface scandirOptions {
    recursive?: boolean,
    fullPath?: boolean,
}

const scandirDefs: scandirOptions = {
    recursive: true,
    fullPath: false,
}

export function scandir(source: string, options?: boolean | scandirOptions): string[] {
    try {
        // validate the directory
        source = normalize(source);
        expectDir(source);

        // load options
        options = (typeof options == "boolean") ? { recursive: options } : options;
        options = (options) ? Object.assign(scandirDefs, options) : scandirDefs;

        // initialize data
        let data = readdirSync(source);
        let files: string[] = [];

        for (let file of data) {
            // add the source path to the file
            let filepath = join(source, file);
            // pushes file to files array
            if (statSync(filepath).isFile()) { files.push(file); }
            // if the recursive option is on, handle the directories
            else if (statSync(filepath).isDirectory() && options.recursive) {
                // scan the subdirectory
                let subfiles = scandir(filepath);
                subfiles = subfiles.map(sub => join(file, sub));
                // concat subdir files to list
                files = files.concat(subfiles);
            }
        }

        // if fullpath option is on, add sourcedir to filename
        if (options.fullPath)
            files = files.map(file => join(source, file));

        // return the final array
        return files;

    } catch (err) {
        console.error(err);
    }
}
