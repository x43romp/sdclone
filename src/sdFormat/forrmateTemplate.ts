import { HashInterface } from "../sdHash";
import { directPath, expectDir, expectFile } from "../sdTools";
import { existsSync, readFileSync } from "fs";
import { parse } from "path";
import { ReadStream } from "tty";

export interface FormatInterface {
    archivepath: string;
    archivefile?: string;                   // This one is for the archive file *.{md5,mhl}
    archivefiles?: string[];
    archivehash?: HashInterface[];
    archivedate?: string;
}

export class FormatTemplate implements FormatInterface {
    archivepath: string;
    archivefile?: string;
    archivefiles?: string[];
    archivehash?: HashInterface[];
    archivedate?: string;

    outputstring: string;

    data: string;

    constructor(path: string) {
        try {
            path = directPath(path);

            if (expectDir(path)) {
                this.archivepath = path;
            } else if (expectFile(path)) {
                this.archivepath = parse(path).dir;
                this.archivefile = directPath(path);
            }

        } catch (error) {
            console.error(path);
        }
    }

    readFile() {
        try {
            // validate the valid file
            if (!existsSync(this.archivefile)) throw 'not a valid file';
            if (!expectDir(this.archivefile)) throw 'not a valid file';

            // get the data file
            this.data = readFileSync(this.archivefile).toString();

        } catch (error) {

        }
    }

    createHeader() {

    }

    createObject(hash: HashInterface) {

    }

    createBody(input: string = "") {
        let output: string;
    }

    getOutput(): string {
        return this.outputstring;
    }

}
