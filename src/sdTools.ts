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