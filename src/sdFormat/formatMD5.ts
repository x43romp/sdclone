import { FormatTemplate } from "./forrmateTemplate";
import { readFileSync, writeFileSync } from "fs";
import { Hash, HashInterface } from "../sdHash";
import { parse, normalize } from "path";
import { directPath } from "../sdTools";

export class FormatMD5 extends FormatTemplate {

    extension = ".md5";

    constructor(path: string) {
        super(path);
    }

    save(filepath: string, data: HashInterface[]) {
        let savefile: string = "";
        savefile = data.map(file => { return `${file.hash}  ${file.filename}`; }).join('\n');
        writeFileSync(filepath, savefile);
    }

}