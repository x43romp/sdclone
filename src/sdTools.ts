import { normalize, join } from "path";
import { statSync, existsSync, readdirSync, fstatSync } from "fs";

enum sdToolErrs {
    pathVoid = "path does not exist",
    pathNotDir = "path is not a directory",
    pathNotFile = "path is not a file",

}

export function expectDir(source: string): boolean {
    try {
        if (!existsSync(source)) throw sdToolErrs.pathVoid;
        if (statSync(source).isDirectory()) return true;
        throw sdToolErrs.pathNotDir;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export function expectFile(source: string): boolean {
    try {
        if (!existsSync(source)) throw sdToolErrs.pathVoid;
        if (statSync(source).isFile()) return true;
        throw sdToolErrs.pathNotFile;
    } catch (error) {
        console.error(error);
        return false;
    }
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