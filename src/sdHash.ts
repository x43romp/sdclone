import { normalize, parse } from "path";
import { expectFile, HashTypes } from "./sdTools";
import { statSync } from "fs";

class Hash {

    _filename: string;
    _filepath: string;
    _filedate: Date;

    _hash: string;
    _hashtype: HashTypes;
    _hashdate: Date;

    constructor(path: string, options?: HashTypes) {
        try {

            path = normalize(path);
            if (!expectFile(path)) throw "invalid file";

            this._filename = parse(path).base;
            this._filepath = path;
            this._filedate = statSync(path).mtime;

        } catch (error) {

            console.error(error);

        }
    }
}