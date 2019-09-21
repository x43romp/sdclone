import { FormatTemplate } from "./forrmateTemplate";
import { readFileSync } from "fs";
import { Hash, HashInterface } from "../sdHash";
import { parse } from "path";

export class FormatMD5 extends FormatTemplate {

    constructor(path: string) {
        super(path);
    }

    readFile() {
        super.readFile();


        let data = readFileSync(this.archivefile).toString();
        let reg = RegExp(/([a-f0-9]{32})(?:\s{1,})(.*)/, 'g');
        let a1;

        this.archivefiles = [];
        this.archivehash = [];
        while ((a1 = reg.exec(data)) !== null) {
            let temp: HashInterface = {
                filepath: a1[2],
                filename: a1[2],
                hash: a1[1],
                hashtype: 'md5',
            };

            this.archivefiles.push(a1[2]);
            this.archivehash.push(temp);
        }

        console.log(this.archivefiles);
    }

}